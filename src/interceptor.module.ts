/**
 * Create by CC on 2022/7/26
 */
import { Module } from '@nestjs/common';
import { HttpInterceptorModule } from './interceptor';
import { GuardModule } from './guard';

@Module({
  imports: [HttpInterceptorModule, GuardModule],
})
export class InterceptorModule {}
