/**
 * 这里是cms系统的api模块
 */
import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filter/httpException.filter';
import { ValidationPipe } from './pipe/validation.pipe';
import { LogInterceptor } from './interceptor/log.interceptor';

import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [UserModule, LoggerModule],
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
