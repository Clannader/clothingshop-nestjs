/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable } from '@nestjs/common';

import { HttpAbstractService } from './http.abstract.service';
import { firstValueFrom, Observable } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Utils } from '@/common/utils';
import { CommonResult } from '@/common';
import { CodeEnum } from '@/common/enum';

@Injectable()
export class JwtHttpService extends HttpAbstractService {
  initInterceptor() {
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (Utils.isEmpty(config.headers['Authorization'])) {
          config.headers['Authorization'] =
            // TODO 这里应该使用的是登录第三方的用户和店铺ID做key值,而不是当前session的用户
            // 应该使用的是initConfig获取到的数据库的用户名和店铺ID
            'Bearer ' +
            ((await this.tokenCacheService.getTokenCache(
              'supervisor-accessToken',
            )) ?? '');
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
      if (CodeEnum.INVALID_TOKEN === code) {
        // 无效的登录,需要重新登录
        return this.loginAction(targetRequest);
      } else if (CodeEnum.TOKEN_EXPIRED === code) {
        // token无效需要刷新
        return this.refreshToken(targetRequest);
      }
    }
    return Promise.resolve(respData);
  }

  private async loginAction(targetRequest: Observable<AxiosResponse>) {
    const loginParams = {
      adminId: 'Supervisor',
      adminPws:
        '043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89',
    };
    // TODO 这里还缺少重试的次数,报错最多重试3次
    const loginObservable = this.makeObservable(
      this.service.post,
      '/gateway/api/oauth/authorize',
      loginParams,
    );
    const [err, result] = await Utils.toPromise(
      firstValueFrom(loginObservable),
    );
    if (err) {
      return Promise.reject(err);
    }
    await this.tokenCacheService.setTokenCache(
      'supervisor-accessToken',
      result.data['accessToken'],
    );
    await this.tokenCacheService.setTokenCache(
      'supervisor-refreshToken',
      result.data['refreshToken'],
    );
    const [errResp, respResult] = await Utils.toPromise(
      firstValueFrom(targetRequest),
    );
    if (errResp) {
      return Promise.reject(errResp);
    }
    return Promise.resolve(respResult);
  }

  private async refreshToken(targetRequest: Observable<AxiosResponse>) {
    const refreshParams = {
      refreshToken: await this.tokenCacheService.getTokenCache(
        'supervisor-refreshToken',
      ),
    };
    const refreshObservable = this.makeObservable(
      this.service.post,
      '/gateway/api/oauth/refreshToken',
      refreshParams,
    );
    const [err, result] = await Utils.toPromise(
      firstValueFrom(refreshObservable),
    );
    if (err) {
      return Promise.reject(err);
    }
    await this.tokenCacheService.setTokenCache(
      'supervisor-accessToken',
      result.data['accessToken'],
    );
    await this.tokenCacheService.setTokenCache(
      'supervisor-refreshToken',
      result.data['refreshToken'],
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
