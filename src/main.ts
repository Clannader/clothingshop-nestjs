import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('cms'); // 这里类似于设置context-path,设置全局的路由前缀,不影响swagger的路由
  // 也就是说swagger的路由访问是不用加上前缀的

  const options = new DocumentBuilder()
    .setTitle('Clothingshop System API')
    .setDescription('The clothingshop restful api')
    .setVersion('1.0')
    .setBasePath('cms') // 如果app加上了context-path,那么这里也要相应的加上,否则访问失败
    .setContact('oliver.wu', 'http://localhost:3000/cms', '294473343@qq.com')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger-ui', app, document);

  await app.listen(3000);
}
bootstrap();
