/**
 * Create by oliver.wu 2024/11/8
 */
import { Injectable, Inject } from '@nestjs/common';
import { SECURITY_SESSION_MANAGE } from '../cache.constants';

import type { Cache } from 'cache-manager';
import type { SecuritySessionStorage } from '@/security';
import { OnEventMessage, SendEventMessage } from '@/lib/event-message';

@Injectable()
export class SecuritySessionCacheService {
  @Inject(SECURITY_SESSION_MANAGE)
  private readonly cacheManager: Cache;

  @SendEventMessage('asyncSecuritySessionCache')
  async setSecuritySessionCache(key: string, value: SecuritySessionStorage) {
    await this.updateSecuritySessionCache(key, value);
  }

  @OnEventMessage('asyncSecuritySessionCache')
  async updateSecuritySessionCache(key: string, value: SecuritySessionStorage) {
    await this.cacheManager.set(key, value);
  }

  getSecuritySessionCache(key: string) {
    return this.cacheManager.get<SecuritySessionStorage>(key);
  }

  @SendEventMessage('deleteSecuritySessionCache')
  async deleteSecuritySessionCache(key: string) {
    await this.messageDeleteSecuritySessionCache(key);
  }

  @OnEventMessage('deleteSecuritySessionCache')
  async messageDeleteSecuritySessionCache(key: string) {
    await this.cacheManager.store.del(key);
  }
}
