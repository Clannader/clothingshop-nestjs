/**
 * Create by CC on 2022/8/9
 */
import { Module } from '@nestjs/common';
import { GatewayAuthController } from './gateway.auth.controller';
import { UserModule } from '@/user';

@Module({
  imports: [UserModule],
  controllers: [GatewayAuthController],
})
export class GatewayModule {}
