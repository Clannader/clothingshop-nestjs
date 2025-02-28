/**
 * Create by CC on 2022/8/11
 */
import { Module } from '@nestjs/common';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@/common/config';
import { MemoryCacheService } from '../services';
import { Keyv } from 'keyv';
import { CacheableMemory, CacheableMemoryOptions } from 'cacheable';
import { SecuritySessionCacheModule } from './security.session.cache.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (config: ConfigService): CacheOptions => {
        const options: CacheableMemoryOptions = {
          ttl: config.get<number>('cacheTTL', 3600) * 1000, // 现在发现cache版本更新后,ttl的单位从s改成了ms
          lruSize: config.get<number>('cacheMax', 100 * 1000),
        };
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory(options),
            }),
          ],
        };
      },
      inject: [ConfigService],
    }),
    SecuritySessionCacheModule,
  ],
  providers: [MemoryCacheService],
  exports: [MemoryCacheService],
})
export class MemoryCacheModule {}
