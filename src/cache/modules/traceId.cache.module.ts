/**
 * Create by oliver.wu 2024/10/23
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { TraceIdCacheService } from '../services';
import { TRACE_ID_CACHE_MANAGER } from '../cache.constants';
import { caching, MemoryConfig } from 'cache-manager';

@Module({
  providers: [
    TraceIdCacheService,
    {
      provide: TRACE_ID_CACHE_MANAGER,
      useFactory: async (config: ConfigService) => {
        const options: MemoryConfig = {
          ttl: config.get<number>('traceIdTTL', 3600) * 1000,
          max: config.get<number>('traceIdMax', 100 * 1000),
        };
        return caching('memory', options);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TraceIdCacheService],
})
export class TraceIdCacheModule {}