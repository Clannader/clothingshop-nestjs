/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';
import {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { CmsSession, CommonResult, ErrorPromise } from '@/common';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';

import { HttpAbstractService } from './http.abstract.service';
import { Observable } from 'rxjs';

@Injectable()
export class LocalhostHttpService extends HttpAbstractService {
  initConfig(session: CmsSession, config: AxiosRequestConfig = {}) {
    this.session = session;
    this.service.defaults.baseURL = config.baseURL;
  }

  initInterceptor() {
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (Utils.isEmpty(config.headers['credential'])) {
          config.headers['credential'] =
            // TODO 这里应该使用的是登录第三方的用户和店铺ID做key值,而不是当前session的用户
            // 应该使用的是initConfig获取到的数据库的用户名和店铺ID
            (await this.tokenCacheService.getTokenCache('supervisor-SYSTEM')) ??
            '';
        }
        config.headers['language'] = this.session.language; // 后期再考虑翻译吧
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.service.interceptors.response.use(
      (response) => {
        return Promise.resolve(response);
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
      if (CodeEnum.INVALID_SESSION === code) {
        // 无效的登录,需要重新登录
      }
    }
    return Promise.resolve(respData);
  }
}
