/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

import { CommonResult } from '@/common';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';

import { HttpAbstractService } from './http.abstract.service';

@Injectable()
export class LocalhostHttpService extends HttpAbstractService {
  initInterceptor() {
    this.service.defaults.baseURL = 'http://localhost:3000';
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (Utils.isEmpty(config.headers['credential'])) {
          config.headers['credential'] =
            (await this.tokenCacheService.getTokenCache('credential')) ?? '';
        }
        config.headers['language'] = 'ZH';
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.service.interceptors.response.use(
      (response) => {
        const data: CommonResult = response.data;
        if (data.code === CodeEnum.INVALID_SESSION) {
          // 重新登录
          return Promise.reject(response.data);
        } else if (data.code !== CodeEnum.SUCCESS) {
          return Promise.reject(response.data);
        }
        return Promise.resolve(response.data);
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }
}
