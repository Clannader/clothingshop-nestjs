/**
 * Create by CC on 2022/8/11
 */
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MemoryCacheService {
  @Inject(CACHE_MANAGER)
  private readonly cacheManager: Cache;

  setTokenCache(key: string, value: any) {
    this.cacheManager.set(`token:${key}`, value);
  }

  getTokenCache(key: string) {
    return this.cacheManager.get(`token:${key}`);
  }

  getAllCacheKeys() {
    return this.cacheManager.store.keys();
  }
}
