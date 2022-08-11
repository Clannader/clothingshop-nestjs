/**
 * Create by CC on 2022/8/11
 */
import { Module } from '@nestjs/common';
import { CACHE_MANAGER, CACHE_MODULE_OPTIONS } from './cache.constants';
import { createCacheManager } from './cache.providers';

@Module({
  providers: [createCacheManager()],
  exports: [CACHE_MANAGER],
})
export class CacheModule {}
