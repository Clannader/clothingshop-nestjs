/**
 * Create by CC on 2022/8/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { caching, Cache } from 'cache-manager';

@Injectable()
export class MemoryCacheService {
  private readonly cacheManager: Cache;

  constructor() {
    // @ts-ignore
    this.cacheManager = caching();
  }

  set<T>(key: string, value: T) {
    this.cacheManager.set(key, value)
  }

  get<T>(key: string): Promise<T | undefined>{
    return this.cacheManager.get(key)
  }

  printAll() {
    const keys = this.cacheManager.store.keys()
    console.log(keys)
  }
}
