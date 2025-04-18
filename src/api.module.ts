/**
 * 这里是cms系统的api模块
 */
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';

import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';
import { GLOBAL_CONFIG } from './common';
import { CommonModule, ConfigModule } from './common/modules';
import { AopMiddleware, XmlMiddleware } from './middleware';
import { MongooseConfigModule } from './dao';
import { AopAspectModule } from './interceptor/aop';
import { SecurityInterceptor } from './interceptor/security';
import { SwaggerModule } from './swagger.module';
import { TasksListModule } from '@/tasks';
import { ApplicationHookModule } from '@/hooks';
import { MemoryCacheModule } from '@/cache/modules';
import { EventMessageModule } from '@/lib/event-message';

@Module({
  imports: [
    CommonModule,
    TasksListModule,
    ApplicationHookModule,
    ConfigModule.register({
      iniFilePath: join(process.cwd(), '/config/config.ini'),
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? join(process.cwd(), '/config/.env.development')
          : join(process.cwd(), '/config/.env.production'),
      isGlobal: true,
      isWatch: true,
      token: GLOBAL_CONFIG,
      // expandVariables: true, // 有bug,暂时去掉,原因是watch文件时,文件被修改了,没有检测到最新的值到内存里面
    }),
    MongooseConfigModule,
    SwaggerModule,
    AopAspectModule,
    MemoryCacheModule,
    EventMessageModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
  ],
})
// export class ApiModule {}
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XmlMiddleware).forRoutes('/*');
    consumer.apply(AopMiddleware).forRoutes('/*');
    // 这里会有个bug,那就是/cms/api/开头的地址如果不存在时也会进入到这个中间件中
    // 这时候就会报中间件的错误信息而不是404
    // 可以按照下面的写法,按照不同的路由写不同的中间件
    // consumer
    //   .apply(ApiMiddleware)
    //   .forRoutes('/cms/gateway/*')
  }
}
