/**
 * Create by oliver.wu 2024/10/23
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { TraceIdCacheService } from '../services';
import { TRACE_ID_CACHE_MANAGER } from '../cache.constants';
import { Keyv } from 'keyv';
import { CacheableMemory, CacheableMemoryOptions } from 'cacheable';
import { createCache } from 'cache-manager';

@Module({
  providers: [
    TraceIdCacheService,
    {
      provide: TRACE_ID_CACHE_MANAGER,
      useFactory: async (config: ConfigService) => {
        const options: CacheableMemoryOptions = {
          ttl: config.get<number>('traceIdTTL', 5 * 60) * 1000,
          lruSize: config.get<number>('traceIdMax', 100 * 1000),
        };
        return createCache({
          stores: [
            new Keyv({
              store: new CacheableMemory(options),
            }),
          ],
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [TraceIdCacheService],
})
export class TraceIdCacheModule {}
