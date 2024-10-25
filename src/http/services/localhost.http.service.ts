/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { CommonResult, ErrorPromise } from '@/common';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';

import { HttpAbstractService } from './http.abstract.service';
import { Observable } from 'rxjs';

@Injectable()
export class LocalhostHttpService extends HttpAbstractService {

  initConfig() {
    this.service.defaults.baseURL = 'http://localhost:5000';
  }

  initInterceptor() {
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (Utils.isEmpty(config.headers['credential'])) {
          config.headers['credential'] =
            // TODO 这里应该使用的是登录第三方的用户和店铺ID做key值,而不是当前session的用户
            // 应该使用的是initConfig获取到的数据库的用户名和店铺ID
            (await this.tokenCacheService.getTokenCache('supervisor-SYSTEM')) ?? '';
        }
        config.headers['language'] = 'ZH'; // 后期再考虑翻译吧
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.service.interceptors.response.use(
      (response) => {
        const data: CommonResult = response.data;
        if (data.code !== CodeEnum.SUCCESS) {
          return Promise.reject(response.data);
        }
        return Promise.resolve(response.data);
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  responseResult<T>(targetRequest: Observable<AxiosResponse<T>>, respData: AxiosResponse<T>): Promise<ErrorPromise | AxiosResponse<T>> {
    return Promise.resolve(respData);
  }

}
