/**
 * 这里是cms系统的api模块
 */
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';
import { LogInterceptor } from './interceptor';

import { UserModule } from './user/user.module';
import { SystemModule } from './system/system.module';
import { LoggerModule } from './logger/logger.module';
import { LoginModule } from './login/login.module';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [UserModule, LoggerModule, SystemModule, LoginModule],
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
      useClass: LogInterceptor,
    },
  ],
})
export class ApiModule {}
