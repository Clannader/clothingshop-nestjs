/**
 * Create by CC on 2022/5/18
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/config/app.module';
// import { ConfigService } from '../../../src/common/config';
import * as request from 'supertest';

describe('ConfigService token测试', () => {
  // let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.getTokenAndGlobal()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it(`ConfigService 获取全局`, () => {
    return request(app.getHttpServer())
      .get('/api/test/search')
      .expect(200)
      .expect('5000');
  });

  it(`ConfigService 获取token`, async () => {
    await request(app.getHttpServer())
      .get('/api/test/search');
    return request(app.getHttpServer())
      .get('/api/test/token')
      .expect(200)
      .expect({
        token: 4000,
        token2: 5000
      });
  });


  afterEach(async () => {
    await app.close();
  });
});
