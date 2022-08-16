/**
 * Create by CC on 2022/8/16
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common';
import { TokenCacheService } from './services';
import { TOKEN_CACHE_MANAGER } from './cache.constants';
import { caching, StoreConfig } from 'cache-manager';

@Module({
  providers: [
    TokenCacheService,
    {
      provide: TOKEN_CACHE_MANAGER,
      useFactory: (config: ConfigService) => {
        const options: StoreConfig = {
          ttl: config.get<number>('cacheTTL', 3600),
          max: config.get<number>('cacheMax', 100 * 1000),
          store: 'memory',
        };
        return caching(options);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TokenCacheService],
})
export class TokenCacheModule {}
