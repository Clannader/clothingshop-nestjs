/**
 * Create by oliver.wu 2024/10/29
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { HttpServiceCacheService } from '../services';
import { HTTP_SERVICE_CACHE_MANAGE } from '../cache.constants';
import Keyv from 'keyv';
import { CacheableMemory, CacheableMemoryOptions } from 'cacheable';
import { createCache } from 'cache-manager';

@Module({
  providers: [
    HttpServiceCacheService,
    {
      provide: HTTP_SERVICE_CACHE_MANAGE,
      useFactory: (config: ConfigService) => {
        const options: CacheableMemoryOptions = {
          lruSize: config.get<number>('cacheMax', 100 * 1000),
        };
        return createCache({
          stores: [
            // 我真的是服了,这个keyv包居然会类型冲突,需要忽略类型校验才可以,要不然打包过不去
            // Two different types with this name exist, but they are unrelated.
            // Types have separate declarations of a private property '_ttl'.
            // @ts-ignore
            new Keyv({
              store: new CacheableMemory(options),
            }),
          ],
          ttl: config.get<number>('cacheTTL', 3600) * 1000,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [HttpServiceCacheService],
})
export class HttpServiceCacheModule {}
