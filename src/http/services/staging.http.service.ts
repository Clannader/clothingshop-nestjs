/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { CommonResult } from '@/common';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';

@Injectable()
export class StagingHttpService extends HttpAbstractService {
  initInterceptor() {
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (Utils.isEmpty(config.headers['cloudparams'])) {
          config.headers['cloudparams'] =
            // TODO 这里应该使用的是登录第三方的用户和店铺ID做key值,而不是当前session的用户
            // 应该使用的是initConfig获取到的数据库的用户名和店铺ID
            (await this.tokenCacheService.getTokenCache('supervisor-super')) ??
            '';
        }
        config.headers['language'] = this.session?.language ?? 'ZH'; // 后期再考虑翻译吧
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  responseResult(
    targetRequest: Observable<AxiosResponse>,
    respData: AxiosResponse,
  ): Promise<AxiosResponse> {
    const data: CommonResult = respData.data;
    const code = data.code;
    if (!Utils.isEmpty(code)) {
      if (302 === code) {
        // 无效的登录,需要重新登录
        return this.loginAction(targetRequest);
      }
    }
    return Promise.resolve(respData);
  }

  private async loginAction(targetRequest: Observable<AxiosResponse>) {
    const loginParams = {
      userid: 'Supervisor',
      password:
        '73d1b1b1bc1dabfb97f216d897b7968e44b06457920f00f2dc6c1ed3be25ad4c',
    };
    // TODO 这里还缺少重试的次数,报错最多重试3次
    const loginObservable = this.makeObservable(
      this.service.post,
      '/ifc/secure/doLogin',
      loginParams,
    );
    const [err, result] = await Utils.toPromise(
      firstValueFrom(loginObservable),
    );
    if (err) {
      return Promise.reject(err);
    }
    const respData = result.data;
    if (302 !== respData.code) {
      return Promise.reject(result);
    }
    await this.tokenCacheService.setTokenCache(
      'supervisor-super',
      result.data['params']['session'],
    );
    const [errResp, respResult] = await Utils.toPromise(
      firstValueFrom(targetRequest),
    );
    if (errResp) {
      return Promise.reject(errResp);
    }
    return Promise.resolve(respResult);
  }
}
