/**
 * 这里是cms系统的api模块
 */
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';

import { CommonModule, ConfigModule, loginUrl } from './common';
import { UserModule } from './user';
import { SystemModule } from './system';
import { LoginModule } from './login';
import { TestModule } from './test/test.module';
import { HttpInterceptorModule } from './interceptor';
import { ApiMiddleware } from './middleware';

import { MongooseConfigService } from './dao';

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
      // expandVariables: true, // 有bug,暂时去掉,原因是watch文件时,文件被修改了,没有检测到最新的值到内存里面
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    HttpInterceptorModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiMiddleware)
      .exclude({
        path: loginUrl,
        method: RequestMethod.ALL,
      })
      // 这里会有个bug,那就是/cms/api/开头的地址如果不存在时也会进入到这个中间件中
      // 这时候就会报中间件的错误信息而不是404
      .forRoutes('/cms/api/*');
    // 可以按照下面的写法,按照不同的路由写不同的中间件
    // consumer
    //   .apply(ApiMiddleware)
    //   .forRoutes('/cms/gateway/*')
  }
}
