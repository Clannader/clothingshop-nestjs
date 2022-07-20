/**
 * Create by CC on 2022/7/20
 */
import { Module } from '@nestjs/common';
import { SessionGuard } from './session.guard';

@Module({
  providers: [SessionGuard],
  exports: [SessionGuard],
})
export class GuardModule {}
