/**
 * Create by oliver.wu 2024/10/29
 */
import { Injectable, Inject } from '@nestjs/common';
import { HTTP_SERVICE_CACHE_MANAGE } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { ServiceOptions, ServiceCache } from '@/http';
import type { HttpAbstractService } from '@/http';
import { omit } from 'lodash';

@Injectable()
export class HttpServiceCacheService {
  @Inject(HTTP_SERVICE_CACHE_MANAGE)
  private readonly cacheManager: Cache;

  private getCacheKey(options: ServiceOptions) {
    return `${options.serviceType}-${options.userName}-${options.shopId}`
  }

  async setHttpServiceCache(options: ServiceOptions, value: ServiceCache) {
    await this.cacheManager.set(this.getCacheKey(options), value);
  }

  getHttpServiceCache(options: ServiceOptions) {
    return this.cacheManager.get<ServiceCache>(this.getCacheKey(options));
  }

  async getServiceCache(options: ServiceOptions): Promise<HttpAbstractService> {
    const cache = await this.getHttpServiceCache(options);
    return cache?.service
  }

  async getServiceOptions(options: ServiceOptions): Promise<ServiceOptions> {
    const cache = await this.getHttpServiceCache(options);
    return cache?.options
  }

  async getServiceToken(options: ServiceOptions) {
    const cache = await this.getHttpServiceCache(options);
    return omit(cache, 'service', 'options');
  }
}