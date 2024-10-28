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

@Injectable()
export class HttpFactoryService {
  @Inject()
  private readonly localhostHttpService: LocalhostHttpService;

  @Inject()
  private readonly stagingHttpService: StagingHttpService;

  @Inject()
  private readonly jwtHttpService: JwtHttpService;

  getHttpService(session: CmsSession, shopType: string): HttpAbstractService {
    // TODO 以后这里传入session,等各种参数,以及查库操作,并且存缓存
    // 每种类型的每个用户存一个独立的Service,然后通过service的初始化config等覆盖公共配置
    // 这样实现类就可以获取到不同的配置了
    let httpService: HttpAbstractService;
    let config: AxiosRequestConfig = {};
    if (shopType === 'localhost') {
      httpService = this.localhostHttpService;
      config = {
        baseURL: 'http://localhost:5000',
      };
    } else if (shopType === 'staging') {
      httpService = this.stagingHttpService;
      config = {
        baseURL: 'http://localhost:3000',
      };
    } else if (shopType === 'jwt') {
      httpService = this.jwtHttpService;
      config = {
        baseURL: 'http://localhost:5000',
      };
    } else {
      throw new Error(`Cannot find http service instance: ${shopType}`);
    }
    // TODO 新增缓存Map<type, Map<username, service>>
    httpService.initConfig(session, config);
    return httpService;
  }

  getLocalhostService(session: CmsSession): LocalhostHttpService {
    return this.getHttpService(session, 'localhost') as LocalhostHttpService;
  }

  getStagingService(session: CmsSession): StagingHttpService {
    return this.getHttpService(session, 'staging') as StagingHttpService;
  }

  getJwtService(session: CmsSession): JwtHttpService {
    return this.getHttpService(session, 'jwt') as JwtHttpService;
  }

}
