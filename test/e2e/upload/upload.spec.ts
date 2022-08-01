/**
 * Create by CC on 2022/8/1
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
// import { readFileSync } from 'fs';
// import { join } from 'path';

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

  it('/cms/api/file/upload/test 测试文件上传', () => {
    return request(app.getHttpServer())
      .post('/cms/api/file/upload/test')
      .attach('file', './test/src/upload/Test.js') // 这个路径是从当前项目的执行目录开始
      .field('fileName', 'Test.js')
      .set(
        'credential',
        's:_KJj_oHMyslaa5ooqPXswOx-FYh5u3wz.ub8QmFp9j0tFH99XRBsai8NoLzVs+krmmmMKo/MqlLU',
      )
      .set('content-type', 'multipart/form-data')
      .set('x-requested-with', 'XMLHttpRequest')
      .expect(200)
      .expect((resp) => {
        console.log(resp);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
