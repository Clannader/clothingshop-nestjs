/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable, Inject } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { TokenCacheService } from '@/cache/services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';

@Injectable()
export abstract class HttpAbstractService {

  public constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    protected readonly service: AxiosInstance,

    @Inject()
    protected readonly tokenCacheService: TokenCacheService,
  ) {
    this.initInterceptor();
  }

  abstract initInterceptor(): void;

  public request = this.service.request
  public delete = this.service.delete
  public head = this.service.head
  public options = this.service.options
  public post = this.service.post;
  public get = this.service.get;
  public put = this.service.put
  public patch = this.service.patch
  public postForm = this.service.postForm
  public putForm = this.service.putForm
  public patchForm = this.service.patchForm
}