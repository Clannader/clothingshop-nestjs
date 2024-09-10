/**
 * Create by CC on 2022/8/16
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { TokenCacheService } from '../services';
import { TOKEN_CACHE_MANAGER } from '../cache.constants';
import { caching, MemoryConfig } from 'cache-manager';

@Module({
  providers: [
    TokenCacheService,
    {
      provide: TOKEN_CACHE_MANAGER,
      useFactory: async (config: ConfigService) => {
        const options: MemoryConfig = {
          ttl: config.get<number>('cacheTTL', 3600),
          max: config.get<number>('cacheMax', 100 * 1000),
        };
        return caching('memory', options);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TokenCacheService],
})
export class TokenCacheModule {}
