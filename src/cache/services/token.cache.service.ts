/**
 * Create by CC on 2022/8/16
 */
import { Injectable, Inject } from '@nestjs/common';
import { TOKEN_CACHE_MANAGER } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { ConfigService } from '@/common/config';

@Injectable()
export class TokenCacheService {
  @Inject(TOKEN_CACHE_MANAGER)
  private readonly cacheManager: Cache;

  @Inject()
  private readonly configService: ConfigService;

  async setTokenCache(key: string, value: string) {
    await this.updateTokenCache(key, value);
    // 只有多进程时才有send方法
    if (this.configService.get<boolean>('clusterServer')) {
      process.send({
        notice: 'updateTokenCache',
        key,
        value,
      });
    }
  }

  async updateTokenCache(key: string, value: string) {
    await this.cacheManager.set(key, value);
  }

  getTokenCache(key: string) {
    return this.cacheManager.get<string>(key);
  }

  getAllCacheKeys() {
    return this.cacheManager.store.keys();
  }
}
