import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AopLogger } from './logger/AopLogger';
import { LogInterceptor } from './interceptor/LogInterceptor';
import helmet from 'helmet';
import { join } from 'path';
import { renderFile } from 'ejs'

async function bootstrap() {
  const aopLogger = new AopLogger();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: aopLogger,
  });
  app.use(helmet())
  app.disable('x-powered-by') // TODO 好像这个又没有效果
  // app.enableCors() // 允许开启CORS
  app.useGlobalInterceptors(new LogInterceptor(aopLogger));
  // app.setGlobalPrefix('cms'); // 这里类似于设置context-path,设置全局的路由前缀,不影响swagger的地址路由
  // 也就是说swagger的路由访问是不用加上前缀的
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('html', renderFile)
  app.setViewEngine('html');

  const port = 3000;
  const options = new DocumentBuilder()
    .setTitle('Clothingshop System API')
    .setDescription('The clothingshop restful api')
    .setVersion('1.0')
    // .setBasePath('cms') // 如果app加上了context-path,那么这里也要相应的加上,否则访问失败.不过后面发现这个方法废弃了
    .setContact('oliver.wu', `http://localhost:${port}/index`, '294473343@qq.com')
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
