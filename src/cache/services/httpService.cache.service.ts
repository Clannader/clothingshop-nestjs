/**
 * Create by oliver.wu 2024/10/29
 */
import { Injectable, Inject } from '@nestjs/common';
import { HTTP_SERVICE_CACHE_MANAGE } from '../cache.constants';

import type { Cache } from 'cache-manager';

@Injectable()
export class HttpServiceCacheService {
  @Inject(HTTP_SERVICE_CACHE_MANAGE)
  private readonly cacheManager: Cache;

  async setTokenCache(key: string, value: string) {
    await this.cacheManager.set(key, value);
  }

  getTokenCache(key: string) {
    return this.cacheManager.get<string>(key);
  }
}