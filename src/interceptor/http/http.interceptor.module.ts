/**
 * Create by CC on 2022/6/2
 */
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpInterceptor } from './http.interceptor';
import { AdminAccessModule } from '@/entities';

@Module({
  imports: [AdminAccessModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
  ],
})
export class HttpInterceptorModule {}
