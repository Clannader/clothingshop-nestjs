import { Provider, CacheManagerOptions } from '@nestjs/common';
import { CACHE_MANAGER, CACHE_MODULE_OPTIONS } from './cache.constants';
import { caching } from 'cache-manager'
import { ConfigService } from '@/common';

/**
 * Creates a CacheManager Provider.
 *
 * @publicApi
 */
export function createCacheManager(): Provider {
  return {
    provide: CACHE_MANAGER,
    useFactory: (options: CacheManagerOptions, config: ConfigService) => {
      const defaultCacheOptions = {
        ttl: config.get<number>('cacheTtl', 60), // 单位秒
        max: config.get<number>('cacheMax', 20),
        store: 'memory'
      }
      // @ts-ignore
      return caching({ ...defaultCacheOptions, ...(options || {}) });
    },
    inject: [CACHE_MODULE_OPTIONS, ConfigService],
  };
}
