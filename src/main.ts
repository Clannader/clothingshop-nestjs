import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AopLogger } from './logger/aop.logger';
import helmet from 'helmet';
import { join } from 'path';
import { renderFile } from 'ejs';
// import * as fs from 'fs';

async function bootstrap() {
  const aopLogger = new AopLogger(); // 后期如果里面依赖了其他service,那么需要修改这个的注入方式
  // 这里导入的是https的证书的方法,不过好像试了报错,不知道是不是证书的问题还是代码的问题
  // 这里不做太多的纠结,因为https可以有很多方法做到,不一定需要代码实现
  // const httpsOptions = {
  //   key: fs.readFileSync('./certs/privateKey.pem'),
  //   cert: fs.readFileSync('./certs/certificate.pem'),
  // };
  // 这里写一下Nest的请求生命周期:一般来说，一个请求流经中间件、守卫与拦截器，然后到达管道，
  // 并最终回到拦截器中的返回路径中（从而产生响应）

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: aopLogger, // 这里应该是修改了底层代码用到的logger函数的调用
    // httpsOptions
  });
  app.use(helmet());
  app.disable('x-powered-by'); // 还是有效果的,一旦用了helmet,框架自动帮去掉这个头了
  // app.enableCors() // 允许开启CORS,不过不满足需求,这里是全局定义的CORS,可能需要部分开启而已
  // app.useGlobalInterceptors(new LogInterceptor(aopLogger));
  // app.setGlobalPrefix('cms'); // 这里类似于设置context-path,设置全局的路由前缀,不影响swagger的地址路由
  // 也就是说swagger的路由访问是不用加上前缀的
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('html', renderFile);
  app.setViewEngine('html');

  const port = 3000;
  const options = new DocumentBuilder()
    .setTitle('Clothingshop System API')
    .setDescription('The clothingshop restful api')
    .setVersion('1.0')
    .addOAuth2() // 要研究一下授权问题,发现有三种授权方式,但是怎么设置都不生效
    // .setBasePath('cms') // 如果app加上了context-path,那么这里也要相应的加上,否则访问失败.不过后面发现这个方法废弃了
    .setContact(
      'oliver.wu',
      `http://localhost:${port}/index`,
      '294473343@qq.com',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger-ui', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 这个参数好像是做持久化认证的
      filter: true,
    },
    // explorer: true,
    customCss: '.swagger-ui .model-box { display:block }',
  });

  await app.listen(port);
}
bootstrap();
