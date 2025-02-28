/**
 * Create by CC on 2022/8/16
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { TokenCacheService } from '../services';
import { TOKEN_CACHE_MANAGER } from '../cache.constants';
import { Keyv } from 'keyv';
import { CacheableMemory, CacheableMemoryOptions } from 'cacheable';
import { createCache } from 'cache-manager';

@Module({
  providers: [
    TokenCacheService,
    {
      provide: TOKEN_CACHE_MANAGER,
      useFactory: (config: ConfigService) => {
        const options: CacheableMemoryOptions = {
          ttl: config.get<number>('tokenTTL', 30 * 60) * 1000,
          lruSize: config.get<number>('tokenMax', 100 * 1000),
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
  exports: [TokenCacheService],
})
export class TokenCacheModule {}
