/**
 * Create by oliver.wu 2024/10/31
 */
import { Module } from '@nestjs/common';

import { SyncUpdateCacheService } from '../services';
import { HttpServiceCacheModule } from './httpService.cache.module';
import { MemoryCacheModule } from './memory.cache.module';
import { TokenCacheModule } from './token.cache.module';
import { TraceIdCacheModule } from './traceId.cache.module';

@Module({
  imports: [
    HttpServiceCacheModule,
    MemoryCacheModule,
    TokenCacheModule,
    TraceIdCacheModule,
  ],
  providers: [SyncUpdateCacheService],
  exports: [SyncUpdateCacheService],
})
export class SyncUpdateCacheModule {}
