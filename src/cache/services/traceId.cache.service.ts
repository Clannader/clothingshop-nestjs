/**
 * Create by oliver.wu 2024/10/23
 */
import { Injectable, Inject } from '@nestjs/common';
import { TRACE_ID_CACHE_MANAGER } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { CmsSession } from '@/common';
import { Utils } from '@/common/utils';
import { ConfigService } from '@/common/config';

@Injectable()
export class TraceIdCacheService {
  @Inject(TRACE_ID_CACHE_MANAGER)
  private readonly cacheManager: Cache;

  @Inject()
  private readonly configService: ConfigService;

  async setTraceIdCache(session: CmsSession, traceId: string) {
    await this.cacheManager.set(session.requestId, traceId);
  }

  async getTraceIdCache(session: CmsSession) {
    const key = session.requestId;
    let traceId: string = await this.cacheManager.get<string>(key);
    const now = Date.now();
    if (Utils.isEmpty(traceId)) {
      traceId = this.configService.get<string>('serverId').toString() + session.workerId.toString() + now.toString() + '#1';
    } else {
      const [tempTraceId, number] = traceId.split('#')
      const sequence: number = +number + 1
      traceId = tempTraceId + '#' + sequence;
    }
    await this.setTraceIdCache(session, traceId)
    return traceId;
  }

}