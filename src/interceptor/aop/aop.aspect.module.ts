/**
 * Create by CC on 2022/7/19
 */
import { Module } from '@nestjs/common';
import { AopAspect } from './aop.aspect';
import { AdminAccessModule } from '@/entities/modules';
import { TraceIdCacheModule, MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [AdminAccessModule, TraceIdCacheModule, MemoryCacheModule],
  providers: [AopAspect],
  exports: [AopAspect],
})
export class AopAspectModule {}
