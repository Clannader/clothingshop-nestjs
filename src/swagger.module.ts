/**
 * Create by CC on 2022/7/26
 */
import { Module } from '@nestjs/common';
import { UserModule } from './user';
import { SystemModule } from './system';
import { LoginModule } from './login';
import { TestModule } from './test';
import { UploadFileModule } from './file';

@Module({
  imports: [
    UserModule,
    SystemModule,
    LoginModule,
    TestModule,
    UploadFileModule,
  ],
})
export class SwaggerModule {}
