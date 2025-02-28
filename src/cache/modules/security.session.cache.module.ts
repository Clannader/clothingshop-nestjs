/**
 * Create by oliver.wu 2024/11/8
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { SecuritySessionCacheService } from '../services';
import { SECURITY_SESSION_MANAGE } from '../cache.constants';
import { Keyv } from 'keyv';
import { CacheableMemory, CacheableMemoryOptions } from 'cacheable';
import { createCache } from 'cache-manager';

@Module({
  providers: [
    SecuritySessionCacheService,
    {
      provide: SECURITY_SESSION_MANAGE,
      useFactory: (config: ConfigService) => {
        const options: CacheableMemoryOptions = {
          ttl: config.get<number>('sessionCacheTTL', 60) * 1000,
          lruSize: config.get<number>('sessionCacheMax', 100 * 1000),
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
  exports: [SecuritySessionCacheService],
})
export class SecuritySessionCacheModule {}
