/**
 * Create by oliver.wu 2024/10/31
 */
import { Injectable, Inject } from '@nestjs/common';

import { HttpServiceCacheService } from './httpService.cache.service';
import { MemoryCacheService } from './memory.cache.service';
import { TokenCacheService } from './token.cache.service';
import { TraceIdCacheService } from './traceId.cache.service';
import { SecuritySessionCacheService } from './security.session.cache.service';

@Injectable()
export class SyncUpdateCacheService {
  @Inject()
  private readonly httpServiceCacheService: HttpServiceCacheService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  @Inject()
  private readonly tokenCacheService: TokenCacheService;

  @Inject()
  private readonly traceIdCacheService: TraceIdCacheService;

  @Inject()
  private readonly securitySessionCacheService: SecuritySessionCacheService;

  startListening() {
    process.on('message', async (message: Record<string, any>) => {
      if (message?.action === 'updateHttpServiceCache') {
        await this.httpServiceCacheService.updateHttpServiceCache(
          message.key,
          message.value,
        );
      } else if (message?.action === 'updateMemoryCache') {
        await this.memoryCacheService.updateMemoryCache(
          message.key,
          message.value,
        );
      } else if (message?.action === 'updateTokenCache') {
        await this.tokenCacheService.updateTokenCache(
          message.key,
          message.value,
        );
      } else if (message?.action === 'updateTraceIdCache') {
        await this.traceIdCacheService.updateTraceIdCache(
          message.key,
          message.value,
        );
      } else if (message?.action === 'deleteTraceIdCache') {
        await this.traceIdCacheService.messageDeleteTraceIdCache(
          message.key,
        );
      } else if (message?.action === 'updateSecuritySessionCache') {
        await this.securitySessionCacheService.updateSecuritySessionCache(
          message.key,
          message.value,
        );
      } else if (message?.action === 'deleteSecuritySessionCache') {
        await this.securitySessionCacheService.messageDeleteSecuritySessionCache(
          message.key,
        );
      }
    });
  }
}
