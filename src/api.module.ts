/**
 * 这里是cms系统的api模块
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';

import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';
import { HttpInterceptor } from './interceptor';

import { CommonModule, ConfigModule } from './common';
import { UserModule } from './user/user.module';
import { SystemModule } from './system/system.module';
import { LoginModule } from './login/login.module';
import { TestModule } from './test/test.module';

import { MongooseConfigService } from './dao/mongoose.config.service';

@Module({
  imports: [
    CommonModule,
    UserModule,
    SystemModule,
    LoginModule,
    TestModule,
    ConfigModule.register({
      iniFilePath: './config/config.ini',
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? './config/.env.development'
          : './config/.env.production',
      isGlobal: true,
      isWatch: true,
      expandVariables: true,
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService
    })
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
