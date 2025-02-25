/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable, Inject } from '@nestjs/common';

import { LocalhostHttpService } from './localhost.http.service';
import { StagingHttpService } from './staging.http.service';
import { JwtHttpService } from './jwt.http.service';

import type { HttpAbstractService } from './http.abstract.service';
import { CmsSession } from '@/common';
import { AxiosRequestConfig } from 'axios';
import { ServiceOptions, ServiceType, ServiceCache } from '../http.types';
import { HttpServiceCacheService } from '@/cache/services';
import { Utils } from '@/common/utils';

@Injectable()
export class HttpFactoryService {
  @Inject()
  private readonly localhostHttpService: LocalhostHttpService;

  @Inject()
  private readonly stagingHttpService: StagingHttpService;

  @Inject()
  private readonly jwtHttpService: JwtHttpService;

  @Inject()
  private readonly httpServiceCacheService: HttpServiceCacheService;

  async getHttpService(
    session: CmsSession,
    shopType: ServiceType,
  ): Promise<HttpAbstractService> {
    // 以后这里传入session,等各种参数,以及查库操作,并且存缓存
    // 每种类型的每个用户存一个独立的Service,然后通过service的初始化config等覆盖公共配置
    // 这样实现类就可以获取到不同的配置了
    let config: AxiosRequestConfig = {};
    const options: ServiceOptions = {
      serviceType: shopType,
    };
    if (shopType === 'localhost') {
      config = {
        baseURL: 'http://localhost:5005',
        // axios的代理只是替换了url,使用代理的地址访问出去而已
        proxy: {
          host: 'localhost',
          port: 5000,
          protocol: 'http:',
        },
      };
      options.userName = 'Supervisor';
      options.password =
        '043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89';
      options.shopId = 'SYSTEM';
    } else if (shopType === 'staging') {
      config = {
        baseURL: 'http://localhost:5005',
        proxy: {
          host: 'localhost',
          port: 3000,
          protocol: 'http:',
        },
      };
      options.userName = 'Supervisor';
      options.password =
        '73d1b1b1bc1dabfb97f216d897b7968e44b06457920f00f2dc6c1ed3be25ad4c';
      options.shopId = 'SYSTEM';
    } else if (shopType === 'jwt') {
      config = {
        baseURL: 'http://localhost:5000',
      };
      options.userName = 'Supervisor';
      options.password =
        '043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89';
      options.shopId = 'SYSTEM';
    } else {
      throw new Error(`Cannot find http service instance: ${shopType}`);
    }
    // axios的对象是同一个,如果多次使用拦截器会把其他实现类的也add进去了
    // httpService.axiosRef.interceptors.request.clear();
    // httpService.axiosRef.interceptors.response.clear();

    let httpService: HttpAbstractService;
    if (shopType === 'localhost') {
      httpService = this.localhostHttpService;
    } else if (shopType === 'staging') {
      httpService = this.stagingHttpService;
    } else if (shopType === 'jwt') {
      httpService = this.jwtHttpService;
    }
    const optionsCache =
      await this.httpServiceCacheService.getServiceOptions(options);
    if (Utils.isEmpty(optionsCache)) {
      const cacheValue: ServiceCache = {
        options,
      };
      await this.httpServiceCacheService.setHttpServiceCache(
        options,
        cacheValue,
      );
    }
    // TODO 考虑每次调用时如果用户名和密码被修改,得等缓存失效
    // 这样写法会导致拦截器一直add进去,考虑同一个类型多个用户时的初始化问题,因为同步缓存不能发送对象,会被序列化,除非能解决这个难题
    // 暂时这样写吧,以后测试还艰难着呢,以后要测试同种类型的service会不会串
    // 感觉这样写之后,上面的那个缓存好像没什么用了,毕竟每个service缓存只需要缓存凭证而已
    httpService.initConfig(session, options, config);
    return httpService;
  }

  async getLocalhostService(
    session: CmsSession,
  ): Promise<LocalhostHttpService> {
    return (await this.getHttpService(
      session,
      'localhost',
    )) as LocalhostHttpService;
  }

  async getStagingService(session: CmsSession): Promise<StagingHttpService> {
    return (await this.getHttpService(
      session,
      'staging',
    )) as StagingHttpService;
  }

  async getJwtService(session: CmsSession): Promise<JwtHttpService> {
    return (await this.getHttpService(session, 'jwt')) as JwtHttpService;
  }
}
