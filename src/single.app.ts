/**
 * Create by oliver.wu 2024/9/25
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NestApplicationOptions } from '@nestjs/common';

// 我真的是醉了,官网没有@types的包,使用import运行时又报错
// 使用require时,使用lint解析又报错,只能忽略这个错误了,以后再说了,坑爹

// const MongoStore = require('connect-mongo');
import { SessionMongoStore } from './dao';
import * as cookieParser from 'cookie-parser';

import './logger/log4js.logger';
import { AppModule } from './app.module';
import { AopLogger } from './logger';
import helmet from 'helmet';
import { join } from 'path';
import { renderFile } from 'ejs';
import * as session from 'express-session';
import {
  sessionName,
  sessionSecret,
  dbSession_Expires,
  GLOBAL_CONFIG,
} from './common';
import { ConfigService } from './common/config';
import { MongooseConfigService } from './dao';
import { SessionMiddleware } from './middleware';
import * as bodyParser from 'body-parser';
import { rateLimit, MemoryStore } from 'express-rate-limit';
// import { SyncUpdateCacheService } from '@/cache/services';
import parseEnv from '@/lib/parseEnv';
import * as fs from 'fs';
import { ApiTagsDescriptionRegistry } from '@/lib/api-tags-description';
// import * as moment from 'moment';
// import * as csurf from 'csurf';

export async function bootstrap() {
  // 这里传null是为了不覆盖源代码里面的context,后面的参数是显示执行时间,源代码是有的,如果不加相当于覆盖了源代码的配置
  const aopLogger = new AopLogger(null, {
    // timestamp: true, // 这东西感觉有点不准确
  }); // 后期如果里面依赖了其他service,那么需要修改这个的注入方式
  // 这里导入的是https的证书的方法,不过好像试了报错,不知道是不是证书的问题还是代码的问题
  // 这里不做太多的纠结,因为https可以有很多方法做到,不一定需要代码实现
  // 这里写一下Nest的请求生命周期:一般来说，一个请求流经中间件、守卫与拦截器，然后到达管道，
  // 并最终回到拦截器中的返回路径中（从而产生响应）

  const serverOptions: NestApplicationOptions = {
    logger: aopLogger, // 这里应该是修改了底层代码用到的logger函数的调用
    rawBody: true,
    bodyParser: true,
  };
  // 原本想同时启用http和https的,但是发现按照官网上面的写法,服务是启动成功了,但是swagger不能显示
  // 并且登录的业务也不能正常使用,暂时就这样留着吧,要么设置http,要么设置https,暂时不使用共存的机制吧
  const isHttps = parseEnv.read('startHttps') === 'true';
  let protocol = 'http';
  if (isHttps) {
    const pemPath = parseEnv.getPemPath();
    const privateKeyPemPath = join(pemPath, 'privateKey.pem');
    const certificatePemPath = join(pemPath, 'certificate.pem');
    if (fs.existsSync(privateKeyPemPath) && fs.existsSync(certificatePemPath)) {
      serverOptions.httpsOptions = {
        key: fs.readFileSync(privateKeyPemPath),
        cert: fs.readFileSync(certificatePemPath),
      };
      protocol = 'https';
    }
  }
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    serverOptions,
  );

  const config: ConfigService = app.get<ConfigService>(GLOBAL_CONFIG);
  const httpPort = config.get<number>('httpPort', 3000);
  const hostName = config.get<string>('hostName', 'localhost');
  const mongooseService = app.get<MongooseConfigService>(MongooseConfigService);
  // const syncUpdateCacheService = app.get<SyncUpdateCacheService>(
  //   SyncUpdateCacheService,
  // );

  app.use(helmet());
  app.disable('x-powered-by'); // 还是有效果的,一旦用了helmet,框架自动帮去掉这个头了
  // app.enableCors() // 允许开启CORS,不过不满足需求,这里是全局定义的CORS,可能需要部分开启而已
  // app.useGlobalInterceptors(new LogInterceptor(aopLogger));
  // app.setGlobalPrefix('cms'); // 这里类似于设置context-path,设置全局的路由前缀,不影响swagger的地址路由
  // 也就是说swagger的路由访问是不用加上前缀的
  app.use(
    rateLimit({
      limit: 20 * 1000,
      windowMs: 15 * 60 * 1000, // 15 minutes
      legacyHeaders: false,
      standardHeaders: true,
      store: new MemoryStore(),
    }),
  );
  app.use(cookieParser());
  app.useBodyParser('json', { limit: '15mb' });
  app.useBodyParser('text', { limit: '15mb' });
  app.useBodyParser('raw', { limit: '15mb' });
  app.useBodyParser('urlencoded', { extended: false, limit: '15mb' });
  // app.use(bodyParser.json({ limit: '15mb' }));
  // app.use(bodyParser.urlencoded({ extended: false, limit: '15mb' }));
  app.use(SessionMiddleware);
  app.use(
    session({
      name: sessionName,
      secret: sessionSecret,
      saveUninitialized: false,
      resave: true,
      store: SessionMongoStore.create({
        client: mongooseService.getConnection().getClient(),
        ttl: dbSession_Expires,
      }),
    }),
  );
  // app.use(csurf({ cookie: true })) // 不是很懂'跨站点请求伪造',暂时注释掉吧,后期有空再研究研究

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.engine('html', renderFile);
  app.setViewEngine('html');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clothingshop System API')
    .setDescription('The clothingshop restful api')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: 'AuthorizationCode from CMS',
    })
    // .addOAuth2({
    //   type: 'oauth2',
    //   description: 'AuthorizationCode from CMS',
    //   flows: {
    //     // implicit: {
    //     //   authorizationUrl: 'https://example.com/api/oauth/dialog',
    //     //   scopes: {
    //     //     'write:pets': 'modify pets in your account',
    //     //     'read:pets': 'read your pets'
    //     //   }
    //     // },
    //     authorizationCode: {
    //       authorizationUrl: `${hostName}/gateway/api/oauth/authorize`,
    //       tokenUrl: `${hostName}/gateway/api/oauth/token`,
    //       scopes: {
    //         // 'write:pets': 'modify pets in your account',
    //         // 'read:pets': 'read your pets'
    //       },
    //     },
    //   },
    // })
    // 要研究一下授权问题,发现有三种授权方式,但是怎么设置都不生效
    // .setBasePath('cms') // 如果app加上了context-path,那么这里也要相应的加上,否则访问失败.不过后面发现这个方法废弃了
    .setContact('oliver.wu', `/index`, '294473343@qq.com');

  const arr = new Map();
  arr.set('GatewayAuthController', '第三方授权接口');
  arr.set('LoginController', '登录模块');
  for (const [key, value] of arr) {
    swaggerConfig.addTag(key, value);
  }

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey}_${methodKey}`;
    },
    // autoTagControllers: false, // 这个的意思是设置true,那么控制器Controller不使用ApiTags也能创建分类,否则需要显示调用ApiTags来创建分类
    // deepScanRoutes: true // 不懂有什么用
  };
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig.build(),
    swaggerOptions,
  );
  SwaggerModule.setup('swagger-ui', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 这个参数好像是做持久化认证的
      filter: true,
      displayOperationId: true, // 显示OperationId
      displayRequestDuration: true, // 显示请求时间
      // docExpansion=none为不展开
      // docExpansion=list为展开
      // docExpansion=full为全部展开,包括接口的详细信息
      docExpansion: 'list', // 默认不展开标签
      tagsSorter: 'alpha', // 可能有alpha beta stable选择,但是没测试过
      operationsSorter: 'alpha',
      // queryConfigEnabled: false, // 看不出有什么效果
      // showExtensions: false, // 看不出有什么效果
      // deepLinking: false, // 这个无效,源代码默认true
    },
    // swaggerUrl: 'http://localhost:3000/swagger-ui-json', // 感觉无效
    // explorer: true,
    // customCss: '.swagger-ui .model-box { display:block }',
    customSiteTitle: 'CMS Swagger UI',
    customCssUrl: '/swagger-ui-override.css',
    jsonDocumentUrl: 'swagger-ui/json', // 默认为swagger-ui-json,可以自定义更换
    yamlDocumentUrl: 'swagger-ui/yaml', // 默认为swagger-ui-yaml,可以自定义更换
    // raw: true, // swagger 8.1.0版本新增是否禁用json/yaml,设置false时不会生成json/yaml文件.如果只想有json,设置['json']
  });

  // Starts listening for shutdown hooks, 如果加入健康检查官网建议开启
  // app.enableShutdownHooks();

  const server = await app.listen(httpPort).then((server) => {
    aopLogger.log(
      `Application is running on: ${protocol}://${hostName}:${httpPort}/swagger-ui`,
    );
    aopLogger.log(
      `SwaggerJson is running on: ${protocol}://${hostName}:${httpPort}/swagger-ui/json`,
    );
    aopLogger.log(
      `SwaggerYaml is running on: ${protocol}://${hostName}:${httpPort}/swagger-ui/yaml`,
    );
    aopLogger.log(
      `Node Version: ${process.version}, processID : ${process.pid}`,
    );
    return server;
  });
  server.keepAliveTimeout = 10 * 1000; // 设置服务器keep alive 为10s,与客户端TCP保持10s长连接无需握手
  // 开始监听同步消息服务
  // syncUpdateCacheService.startListening();
  // 启动完成写启动时间
  // config.set('serverStartDate', moment().format('YYYY-MM-DD HH:mm:ss,SSS'));
}

//处理未知的报错，防止服务器塌了
process.on('uncaughtException', function (err) {
  console.trace(err);
});
