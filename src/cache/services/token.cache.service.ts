/**
 * Create by CC on 2022/8/16
 */
import { Injectable, Inject } from '@nestjs/common';
import { TOKEN_CACHE_MANAGER } from '../cache.constants';

import type { Cache } from 'cache-manager';

@Injectable()
export class TokenCacheService {
  @Inject(TOKEN_CACHE_MANAGER)
  private readonly cacheManager: Cache;

  setTokenCache(key: string, value: any) {
    this.cacheManager.set(key, value);
  }

  getTokenCache(key: string) {
    return this.cacheManager.get(key);
  }

  getAllCacheKeys() {
    return this.cacheManager.store.keys();
  }
}
