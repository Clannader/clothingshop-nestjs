/**
 * Create by oliver.wu 2024/11/8
 */
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@/common/config';
import { SecuritySessionCacheService } from '../services';
import { caching, MemoryConfig } from 'cache-manager';
import { SECURITY_SESSION_MANAGE } from '../cache.constants';

@Module({
  providers: [
    SecuritySessionCacheService,
    {
      provide: SECURITY_SESSION_MANAGE,
      useFactory: (config: ConfigService) => {
        const options: MemoryConfig = {
          ttl: config.get<number>('sessionCacheTTL', 60) * 1000,
          max: config.get<number>('sessionCacheMax', 100 * 1000),
        };
        return caching('memory', options);
      },
      inject: [ConfigService],
    },
  ],
  exports: [SecuritySessionCacheService],
})
export class SecuritySessionCacheModule {}
