/**
 * 这里是cms系统的api模块
 */
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';
import { HttpInterceptor } from './interceptor';

import { CommonModule } from './common';
import { UserModule } from './user/user.module';
import { SystemModule } from './system/system.module';
import { LoginModule } from './login/login.module';
import { TestModule } from './test/test.module';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    CommonModule,
    UserModule,
    SystemModule,
    LoginModule,
    TestModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
  ],
})
export class ApiModule {}
