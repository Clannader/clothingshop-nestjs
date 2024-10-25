/**
 * Create by CC on 2022/8/11
 */
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@/common/config';
import { MemoryCacheService } from '../services';
import { caching, MemoryConfig } from 'cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => {
        const options: MemoryConfig = {
          ttl: config.get<number>('cacheTTL', 3600) * 1000, // 现在发现cache版本更新后,ttl的单位从s改成了ms
          max: config.get<number>('cacheMax', 100 * 1000),
        };
        return caching('memory', options);
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MemoryCacheService],
  exports: [MemoryCacheService],
})
export class MemoryCacheModule {}
