/**
 * Create by CC on 2022/6/2
 */
import { Module } from '@nestjs/common';
import { HttpInterceptor } from './http.interceptor';
import { AdminAccessModule } from '@/entities';

@Module({
  imports: [AdminAccessModule],
  providers: [HttpInterceptor],
  exports: [HttpInterceptor],
})
export class HttpInterceptorModule {}
