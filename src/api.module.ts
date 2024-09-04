/**
 * 这里是cms系统的api模块
 */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { join } from 'path';

import { HttpExceptionFilter } from './filter';
import { ValidationPipe } from './pipe';
import { CommonModule, ConfigModule, GLOBAL_CONFIG } from './common';
import { AopMiddleware, XmlMiddleware } from './middleware';
import { MongooseConfigService } from './dao';
import { AopAspectModule } from './interceptor';
import { SwaggerModule } from './swagger.module';

@Module({
  imports: [
    CommonModule,
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
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    SwaggerModule,
    AopAspectModule,
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
