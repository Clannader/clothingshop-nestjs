/**
 * Create by CC on 2022/7/26
 */
import { Module } from '@nestjs/common';
import { UserModule } from './user';
import { SystemModule } from './system';
import { LoginModule } from './login';
import { TestModule } from './test';
import { UploadFileModule } from './file';
import { GatewayModule } from './gateway';
import { DatabaseModule } from './database';

@Module({
  imports: [
    UserModule,
    SystemModule,
    LoginModule,
    TestModule,
    UploadFileModule,
    GatewayModule,
    DatabaseModule,
  ],
})
export class SwaggerModule {}
