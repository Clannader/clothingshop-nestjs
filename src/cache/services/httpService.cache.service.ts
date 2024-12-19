/**
 * Create by oliver.wu 2024/10/29
 */
import { Injectable, Inject } from '@nestjs/common';
import { HTTP_SERVICE_CACHE_MANAGE } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { ServiceOptions, ServiceCache } from '@/http';
import { omit } from 'lodash';
// import { ConfigService } from '@/common/config';
import { OnEventMessage, SendEventMessage } from '@/lib/event-message';

@Injectable()
export class HttpServiceCacheService {
  @Inject(HTTP_SERVICE_CACHE_MANAGE)
  private readonly cacheManager: Cache;

  // @Inject()
  // private readonly configService: ConfigService;

  private getCacheKey(options: ServiceOptions) {
    return `${options.serviceType}-${options.userName}-${options.shopId}`;
  }

  @SendEventMessage('asyncHttpServiceCache')
  async setHttpServiceCache(options: ServiceOptions, value: ServiceCache) {
    await this.updateHttpServiceCache(options, value);
    // if (this.configService.get<boolean>('clusterServer')) {
    //   process.send({
    //     notice: 'updateHttpServiceCache',
    //     key: options,
    //     value,
    //   });
    // }
  }

  @OnEventMessage('asyncHttpServiceCache')
  async updateHttpServiceCache(options: ServiceOptions, value: ServiceCache) {
    await this.cacheManager.set(this.getCacheKey(options), value);
  }

  getHttpServiceCache(options: ServiceOptions) {
    return this.cacheManager.get<ServiceCache>(this.getCacheKey(options));
  }

  async getServiceOptions(options: ServiceOptions): Promise<ServiceOptions> {
    const cache = await this.getHttpServiceCache(options);
    return cache?.options;
  }

  async getServiceToken(options: ServiceOptions) {
    const cache = await this.getHttpServiceCache(options);
    return omit(cache, 'service', 'options');
  }

  async setServiceToken(
    options: ServiceOptions,
    value: Omit<ServiceCache, 'options'>,
  ) {
    const cache = await this.getHttpServiceCache(options);
    if (cache) {
      for (const key in value) {
        cache[key] = value[key];
      }
      await this.setHttpServiceCache(options, cache);
    }
  }
}
