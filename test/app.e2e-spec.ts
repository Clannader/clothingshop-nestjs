import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { readFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { renderFile } from 'ejs';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    // 他只是重新创建了一个新的app,并不是使用我的main.ts里面的app去设置
    // 所以后期看看如何声明的时候可以使用我配置的app,否则这个app还得复制从main.ts里面复制一堆配置代码过来声明
    // 很不是方便
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.engine('html', renderFile);
    app.setViewEngine('html');
    await app.init();
  });

  it('/index (GET)', () => {
    return request(app.getHttpServer())
      .get('/index')
      .expect(200)
      .expect(readFileSync(join(__dirname, '..', '/views/index.html')).toString())
  });

  it('/index/testing (GET)', () => {
    return request(app.getHttpServer())
      .get('/index/testing')
      .expect(200)
      .expect(readFileSync(join(__dirname, '..', 'views/index.html')).toString())
  });

  afterAll(async () => {
    await app.close();
  });
});
