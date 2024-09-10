/**
 * Create by CC on 2022/8/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

@Injectable()
export class MemoryCacheService {
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  setMemoryCache(key: string, value: any) {
    this.cacheManager.set(key, value);
  }

  getMemoryCache(key: string) {
    return this.cacheManager.get(key);
  }

  getAllCacheKeys() {
    return this.cacheManager.store.keys();
  }
}
