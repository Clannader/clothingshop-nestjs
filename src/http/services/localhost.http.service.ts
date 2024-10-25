/**
 * Create by oliver.wu 2024/10/24
 */
import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';

import { CommonResult } from '@/common';
import { TokenCacheService } from '@/cache/services';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';

@Injectable()
export class LocalhostHttpService {
  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    private readonly service: AxiosInstance,

    @Inject()
    private readonly tokenCacheService: TokenCacheService,
  ) {
    this.initInterceptor();
  }

  private initInterceptor() {
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

  request = this.service.request
  delete = this.service.delete
  head = this.service.head
  options = this.service.options
  post = this.service.post;
  get = this.service.get;
  put = this.service.put
  patch = this.service.patch
  postForm = this.service.postForm
  putForm = this.service.putForm
  patchForm = this.service.patchForm
}
