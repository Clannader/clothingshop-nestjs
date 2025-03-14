/**
 * Create by CC on 2022/8/16
 */
import { Injectable, Inject } from '@nestjs/common';
import { TOKEN_CACHE_MANAGER } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { OnEventMessage, SendEventMessage } from '@/lib/event-message';

@Injectable()
export class TokenCacheService {
  @Inject(TOKEN_CACHE_MANAGER)
  private readonly cacheManager: Cache;

  @SendEventMessage('asyncTokenCache')
  async setTokenCache(key: string, value: string) {
    await this.updateTokenCache(key, value);
  }

  @OnEventMessage('asyncTokenCache')
  async updateTokenCache(key: string, value: string) {
    await this.cacheManager.set(key, value);
  }

  getTokenCache(key: string) {
    return this.cacheManager.get<string>(key);
  }

  // getAllCacheKeys() {
  //   return this.cacheManager.store.keys();
  // }
}
