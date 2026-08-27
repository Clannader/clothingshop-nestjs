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
import { SessionMongoStore, MongooseConfigService } from './dao';
import cookieParser from 'cookie-parser';

import './logger/log4js.logger';
import { AppModule } from './app.module';
import { AopLogger } from './logger';
import helmet from 'helmet';
import { join } from 'path';
import { renderFile } from 'ejs';
import session from 'express-session';
import {
  sessionName,
  sessionSecret,
  DbSession_Expires,
  GLOBAL_CONFIG,
  filterXss,
  mongoSanitize,
  RequestSession,
  Session_Expires,
} from './common';
import { ConfigService } from './common/config';
import { SessionMiddleware } from './middleware';
// import * as bodyParser from 'body-parser';
import { rateLimit, MemoryStore } from 'express-rate-limit';
// import { SyncUpdateCacheService } from '@/cache/services';
import parseEnv from '@/lib/parseEnv';
import * as fs from 'fs';
import { ApiTagsDescriptionRegistry } from '@/lib/api-tags-description';
import expressStaticGzip from 'express-static-gzip';
import { parse as qsParse } from 'qs';
// import * as crypto from 'node:crypto';
// import * as passport from 'passport';
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

  // 解决前端报错加CSP响应头,但是还是无法消除
  // app.use((req: any, res: any, next: any) => {
  //   const nonce = crypto.randomBytes(16).toString('base64');
  //   return helmet({
  //     contentSecurityPolicy:{
  //       directives: {
  //         defaultSrc: ["'self'"],
  //         scriptSrc: ["'self'", `'nonce-${nonce}'`],
  //         styleSrc: ["'self'"],
  //         imgSrc: ["'self'", "data:", "https:"]
  //       }
  //     }
  //   })(req, res, next)
  // });
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
        ttl: DbSession_Expires,
      }),
    }),
  );
  app.set('query parser', (str: string) => {
    // Express 5 默认使用querystring = require('node:querystring')来格式化query
    // 现在重写格式化query方法,因为query变成可读了
    const parsed = qsParse(str, {
      // 这里的参数,还可以看qs的文档,以后根据业务需求进行修改
      // https://www.npmjs.com/package/qs
      depth: 10,
      arrayLimit: 100,
    });
    return JSON.parse(filterXss.process(JSON.stringify(mongoSanitize(parsed))));
  });

  // >>> 新增SAML协议授权
  // app.use(passport.initialize());
  // app.use(passport.session());
  // passport.serializeUser((user, done) => {
  //   // 序列化用户
  //   console.log('3-序列化用户')
  //   done(null, user);
  // });
  // passport.deserializeUser((user, done) => {
  //   // 反序列化用户
  //   console.log('1-先反序列化用户')
  //   done(null, user);
  // });
  // <<< 新增SAML协议授权
  // app.use(csurf({ cookie: true })) // 不是很懂'跨站点请求伪造',暂时注释掉吧,后期有空再研究研究

  app.use(
    expressStaticGzip(join(process.cwd(), 'public'), {
      enableBrotli: true,
      orderPreference: ['br', 'gz'],
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.engine('html', renderFile);
  app.setViewEngine('html');

  const oauthName = 'oauth2-auth-code' // 安全方案名称
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clothingshop System API')
    .setDescription('The clothingshop restful api')
    .setVersion('1.0')
    // .addBearerAuth({
    //   type: 'http',
    //   description: 'AuthorizationCode from CMS',
    // })
    // OAuth2授权使用authorizationCode模式(授权码模式):Swagger UI点Authorize后不再弹用户名/密码输入框,
    // 而是新开窗口跳转到authorizationUrl(GET)展示后端授权页,用户确认授权后302回swagger-ui的
    // {origin}/swagger-ui/oauth2-redirect.html回调页并携带一次性授权码code,回调页再POST到tokenUrl(form-urlencoded)用code换token
    // 注意1:后端需要提供三件套:GET授权页(校验CMS登录态)+签发一次性code+标准token端点(code换JWT);
    // 项目现有的/gateway/api/oauth/authorize是POST+JSON+加密密码的自定义协议(服务间JwtHttpService专用),需新增GET路由
    // 注意2:authorizationUrl/tokenUrl这里只写相对路径作为兜底值,因为启动时无法预知浏览器实际用哪个域名/IP访问swagger-ui;
    //       完整URL由下方patchDocumentOnRequest钩子按每次请求的Host头动态改写成http(s)://{当前域名}/gateway/api/...,
    //       拼出来的origin就是浏览器当前访问swagger-ui的域名,所以依旧不存在跨域问题(项目未开启CORS)
    // 注意3:回调页由@nestjs/swagger将swagger-ui-dist整目录静态挂载在/swagger-ui前缀下自动提供(public目录无需复制文件);
    //       redirect_uri问题:swagger-ui默认按"当前页面pathname去掉最后一段"拼接oauth2-redirect.html,无尾斜杠访问
    //       /swagger-ui时目录为空串导致回调页落在根路径;且swaggerOptions是启动时静态序列化进swagger-ui-init.js的,
    //       patchDocumentOnRequest只能改document改不了swaggerOptions,无法按请求域名动态,故由下方customJsStr内联
    //       脚本包装window.SwaggerUIBundle,在浏览器端按当前origin动态注入oauth2RedirectUrl;
    //       授权端点必须校验redirect_uri白名单(只放行{origin}/swagger-ui/oauth2-redirect.html回调页地址)
    //       防止开放重定向;code需一次性消费+短TTL(如120秒)
    // 注意4:Swagger UI属于公共客户端,禁止在initOAuth里配置clientSecret(会暴露到前端浏览器)
    .addOAuth2(
      {
        type: 'oauth2',
        // description: 'OAuth2授权码模式,跳转CMS授权页确认授权后自动获取Token', // 描述有效,显示在swagger的授权界面中
        flows: {
          authorizationCode: {
            authorizationUrl: '/gateway/api/oauth/authorize',
            tokenUrl: '/gateway/api/oauth/token',
            scopes: {
              // read: 'Read access to protected resources',
              // write: 'Write access to protected resources',
            },
          },
        },
      },
      oauthName, // 安全方案名称
    )
    // .setBasePath('cms') // 如果app加上了context-path,那么这里也要相应的加上,否则访问失败.不过后面发现这个方法废弃了
    .setContact('oliver.wu', `/index`, '294473343@qq.com');

  const apiTagsMap = ApiTagsDescriptionRegistry.scanControllerTags(app);
  for (const [key, value] of apiTagsMap) {
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
      // OAuth2授权弹窗的预填参数,这个是之前OAuth2不生效的原因之一:
      // 光在DocumentBuilder里面addOAuth2声明还不够,这里必须初始化initOAuth配置
      initOAuth: {
        clientId: 'SwaggerUI',
        appName: 'CMS-Swagger-UI',
        additionalQueryStringParams: {},
        useBasicAuthenticationWithAccessCodeGrant: false,
        usePkceWithAuthorizationCodeGrant: true, // 推荐开启 PKCE 增强安全性
        // clientSecret: 'CmsChina',
        // 暂时不知道这2个参数用来干嘛
        // realm: 'demo-realm',
        // scopeSeparator: ' ',
      },
      filter: true,
      displayOperationId: true, // 显示OperationId
      displayRequestDuration: true, // 显示请求时间
      // docExpansion=none为不展开
      // docExpansion=list为展开
      // docExpansion=full为全部展开,包括接口的详细信息
      docExpansion: 'list', // 默认不展开标签
      tagsSorter: 'alpha', // 可能有alpha beta stable选择,但是没测试过
      operationsSorter: 'alpha',
      // 这个参数可以直接修改oauth2-redirect.html域名地址
      // 不过感觉还是js修改的比较好,要不然使用patchDocumentOnRequest里面重写
      // 不过patchDocumentOnRequest里面的document没有oauth2RedirectUrl这个设置了,没办法根据不同域名变幻
      // oauth2RedirectUrl: `${protocol}://${hostName}:${httpPort}/swagger-ui/oauth2-redirect.html`,
      // queryConfigEnabled: false, // 看不出有什么效果
      // showExtensions: false, // 看不出有什么效果
      // deepLinking: false, // 这个无效,源代码默认true
    },
    // swaggerUrl: 'http://localhost:3000/swagger-ui-json', // 感觉无效
    // explorer: true,
    // customCss: '.swagger-ui .model-box { display:block }',
    customSiteTitle: 'CMS Swagger UI',
    customCssUrl: '/swagger-ui-override.css',
    customJs: '/swagger-ui-override.js', // 修改oauth2-redirect.html域名可以不通过修改js
    jsonDocumentUrl: 'swagger-ui/json', // 默认为swagger-ui-json,可以自定义更换
    yamlDocumentUrl: 'swagger-ui/yaml', // 默认为swagger-ui-yaml,可以自定义更换
    // raw: true, // swagger 8.1.0版本新增是否禁用json/yaml,设置false时不会生成json/yaml文件.如果只想有json,设置['json']
    // 未登录时返回占位空文档(对齐springdoc参考站点的行为),登录后才返回完整文档,避免未认证用户拿到API明细
    // 注意:该钩子必须写在setup第4个参数的顶层(与swaggerOptions同级),源码里json/yaml/swagger-ui-init.js
    // 三个端点都是从顶层读取patchDocumentOnRequest,写在swaggerOptions内部是不会生效的
    // 注意:回调参数不能直接标注RequestSession(泛型签名<TRequest=any>逆变不兼容会报TS2322),在函数体内cast
    patchDocumentOnRequest: (req, _res, document) => {
      // 按当前请求动态改写OAuth2授权/令牌地址为完整URL:createDocument是启动时执行的,
      // 那时无法预知浏览器会用localhost/IP/域名中的哪种方式访问swagger-ui,
      // 所以在每次请求swagger json/yaml/init.js时按请求头动态拼origin;
      // 协议优先取X-Forwarded-Proto(反向代理https卸载场景),无该代理头时express按socket是否TLS判定
      const swaggerReq = req as RequestSession;
      const forwardedProto = swaggerReq.headers['x-forwarded-proto'];
      const swaggerProtocol =
        typeof forwardedProto === 'string' && forwardedProto
          ? forwardedProto
          : swaggerReq.protocol;
      const swaggerOrigin = `${swaggerProtocol}://${swaggerReq.get('host')}`;
      // addOAuth2不传name时securitySchemes的key默认为oauth2(@nestjs/swagger的document-builder默认参数)
      const oauth2Flows = (
        document.components?.securitySchemes?.[oauthName] as {
          flows?: {
            authorizationCode?: {
              authorizationUrl?: string;
              tokenUrl?: string;
            };
          };
        }
      )?.flows?.authorizationCode;
      if (oauth2Flows) {
        // 直接改写全局document的引用:每次请求都会按当前域名重新覆盖,多域名并发访问的竞态窗口可忽略
        oauth2Flows.authorizationUrl = `${swaggerOrigin}/gateway/api/oauth/authorize`;
        oauth2Flows.tokenUrl = `${swaggerOrigin}/gateway/api/oauth/token`;
      }
      // 判定登录态,与SessionGuard保持一致:session里有adminSession且未过期
      const adminSession = swaggerReq.session?.adminSession;
      const isLogin =
        !!adminSession && Date.now() - adminSession.expires <= Session_Expires;
      if (isLogin) {
        // 滑动续期,与SessionGuard保持一致
        adminSession.expires = Date.now() + Session_Expires;
        return document;
      }
      return {
        openapi: document.openapi,
        info: {
          title: `401 (Unauthorized) | ${document.info.title}`,
          description:
            'API schema is only available for authenticated users. In order to proceed authenticate yourself.',
          version: document.info.version,
        },
        paths: {},
        // 保留securitySchemes,让Swagger UI的Authorize按钮仍然可用
        components: {
          securitySchemes: document.components?.securitySchemes,
        },
      };
    },
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
process.prependListener('uncaughtException', function (err) {
  console.trace(err);
});
