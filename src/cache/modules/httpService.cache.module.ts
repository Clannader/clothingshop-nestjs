/**
 * Create by oliver.wu 2024/10/29
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { HttpServiceCacheService } from '../services';
import { HTTP_SERVICE_CACHE_MANAGE } from '../cache.constants';
import { Keyv } from 'keyv';
import { CacheableMemory, CacheableMemoryOptions } from 'cacheable';
import { createCache } from 'cache-manager';

@Module({
  providers: [
    HttpServiceCacheService,
    {
      provide: HTTP_SERVICE_CACHE_MANAGE,
      useFactory: (config: ConfigService) => {
        const options: CacheableMemoryOptions = {
          ttl: config.get<number>('cacheTTL', 3600) * 1000,
          lruSize: config.get<number>('cacheMax', 100 * 1000),
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
  exports: [HttpServiceCacheService],
})
export class HttpServiceCacheModule {}
