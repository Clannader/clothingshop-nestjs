import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AopLogger } from './logger/AopLogger';
import { LogInterceptor } from './interceptor/LogInterceptor';

// import { join } from 'path';

async function bootstrap() {
  const aopLogger = new AopLogger();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: aopLogger,
  });
  app.useGlobalInterceptors(new LogInterceptor(aopLogger));
  // app.setGlobalPrefix('cms'); // 这里类似于设置context-path,设置全局的路由前缀,不影响swagger的路由
  // 也就是说swagger的路由访问是不用加上前缀的
  // app.useStaticAssets(join(__dirname, 'public')); // 好像不生效

  const port = 3000;
  const options = new DocumentBuilder()
    .setTitle('Clothingshop System API')
    .setDescription('The clothingshop restful api')
    .setVersion('1.0')
    // .setBasePath('cms') // 如果app加上了context-path,那么这里也要相应的加上,否则访问失败,发现这个方法废弃了
    .setContact('oliver.wu', `http://localhost:${port}`, '294473343@qq.com')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger-ui', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // TODO 好像这个参数暂时不生效,不知道什么情况
    },
  });

  await app.listen(port);
}
bootstrap();
