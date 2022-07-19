/**
 * Create by CC on 2022/7/17
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import * as cookieParser from 'cookie-parser';
import { SessionMiddleware } from '@/middleware';
import { sessionName, sessionSecret, dbSession_Expires } from '@/common';
import { MongooseConfigService, SessionMongoStore } from '@/dao';
import * as request from 'supertest';
import * as session from 'express-session';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    const mongooseService = app.get<MongooseConfigService>(
      MongooseConfigService,
    );
    app.use(cookieParser());
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
    await app.init();
  });

  it('/api/test/xxxx (GET) 地址不存在', () => {
    return request(app.getHttpServer())
      .get('/api/test/xxxx')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.code).toEqual(404);
        expect(body.msg).toContain('/api/test/xxxx');
        expect(body.timestamp).toBeDefined();
        expect(body.path).toEqual('/api/test/xxxx');
      });
  });

  it('/api/test/xxxx (POST) 地址不存在', () => {
    return request(app.getHttpServer())
      .post('/api/test/xxxx')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.code).toEqual(404);
        expect(body.msg).toContain('/api/test/xxxx');
        expect(body.timestamp).toBeDefined();
        expect(body.path).toEqual('/api/test/xxxx');
      });
  });

  it('/cms/api/user/search2 (GET) cms前缀地址不存在', () => {
    return request(app.getHttpServer())
      .get('/cms/api/user/search2')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.code).toEqual(404);
        expect(body.msg).toContain('/cms/api/user/search2');
        expect(body.timestamp).toBeDefined();
        expect(body.path).toEqual('/cms/api/user/search2');
      });
  });

  it('/cms/api/user/login (GET) 地址正确,请求方式错误', () => {
    return request(app.getHttpServer())
      .get('/cms/api/user/login')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.code).toEqual(404);
        expect(body.msg).toContain('/cms/api/user/login');
        expect(body.timestamp).toBeDefined();
        expect(body.path).toEqual('/cms/api/user/login');
      });
  });

  it('/cms/api/user/login (POST) 登录接口不传参数', () => {
    return request(app.getHttpServer())
      .post('/cms/api/user/login')
      .expect(200)
      .expect((res) => {
        const body = res.body;
        expect(body.code).toEqual(1005);
        expect(body.msg).toEqual('adminId must be a string');
        expect(body.timestamp).toBeDefined();
        expect(body.path).toEqual('/cms/api/user/login');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
