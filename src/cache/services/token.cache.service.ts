/**
 * Create by CC on 2022/8/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { caching, Cache } from 'cache-manager';

@Injectable()
export class TokenCacheService {
  private readonly cacheManager: Cache;

  constructor() {
    // @ts-ignore
    this.cacheManager = caching();
  }
}
