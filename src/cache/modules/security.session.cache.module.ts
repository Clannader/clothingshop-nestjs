/**
 * Create by oliver.wu 2024/11/8
 */
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@/common/config';
import { SecuritySessionCacheService } from '../services';
import { caching, MemoryConfig } from 'cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => {
        const options: MemoryConfig = {
          ttl: config.get<number>('sessionCacheTTL', 60) * 1000, // 现在发现cache版本更新后,ttl的单位从s改成了ms
          max: config.get<number>('sessionCacheMax', 100 * 1000),
        };
        return caching('memory', options);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SecuritySessionCacheService],
  exports: [SecuritySessionCacheService],
})
export class SecuritySessionCacheModule {}
