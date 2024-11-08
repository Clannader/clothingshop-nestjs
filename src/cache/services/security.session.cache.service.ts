/**
 * Create by oliver.wu 2024/11/8
 */
import { Injectable, Inject } from '@nestjs/common';
import { SECURITY_SESSION_MANAGE } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { ConfigService } from '@/common/config';
import type { SecuritySessionStorage } from '@/security';

@Injectable()
export class SecuritySessionCacheService {
  @Inject(SECURITY_SESSION_MANAGE)
  private readonly cacheManager: Cache;

  @Inject()
  private readonly configService: ConfigService;

  async setSecuritySessionCache(key: string, value: SecuritySessionStorage) {
    await this.updateSecuritySessionCache(key, value);
    // 只有多进程时才有send方法
    if (this.configService.get<boolean>('clusterServer')) {
      process.send({
        notice: 'updateSecuritySessionCache',
        key,
        value,
      });
    }
  }

  async updateSecuritySessionCache(key: string, value: SecuritySessionStorage) {
    await this.cacheManager.set(key, value);
  }

  getSecuritySessionCache(key: string) {
    return this.cacheManager.get<SecuritySessionStorage>(key);
  }
}
