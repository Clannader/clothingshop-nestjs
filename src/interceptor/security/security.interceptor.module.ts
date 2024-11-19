/**
 * Create by CC on 2022/6/2
 */
import { Module } from '@nestjs/common';
import { SecurityInterceptor } from './security.interceptor';
import { MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [MemoryCacheModule],
  providers: [SecurityInterceptor],
  exports: [SecurityInterceptor],
})
export class SecurityInterceptorModule {}
