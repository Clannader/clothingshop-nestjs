/**
 * Create by CC on 2022/8/11
 */
import {  Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@/common/config';
import { MemoryCacheService } from '../services';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        ttl: config.get<number>('cacheTTL', 3600),
        max: config.get<number>('cacheMax', 100 * 1000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MemoryCacheService],
  exports: [MemoryCacheService],
})
export class MemoryCacheModule {}
