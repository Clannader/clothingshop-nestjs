/**
 * Create by oliver.wu 2024/11/8
 */
import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'node:crypto';

import { SecuritySessionCacheService } from '@/cache/services';

export class SecuritySessionStorage {
  sessionId: string;
  vectorValue: string;
}

@Injectable()
export class SecuritySessionService {

  @Inject()
  private readonly securitySessionCacheService: SecuritySessionCacheService;

  async getNewSessionStorage() {
    const sessionId = crypto.randomUUID();
    const vectorValue = crypto.randomBytes(12).toString('hex');
    const storage = new SecuritySessionStorage()
    storage.sessionId = sessionId;
    storage.vectorValue = vectorValue;
    await this.securitySessionCacheService.setSecuritySessionCache(sessionId, storage);
    return storage;
  }
}
