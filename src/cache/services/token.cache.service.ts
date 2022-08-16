/**
 * Create by CC on 2022/8/16
 */
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TOKEN_CACHE_MANAGER } from '../cache.constants';

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
