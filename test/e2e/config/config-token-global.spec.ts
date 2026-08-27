/**
 * Create by CC on 2022/5/18
 * 这里是TOKEN和Global同时实例化
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
// import { ConfigService } from '../../../src/common/config';
import request from 'supertest';

describe('ConfigService token测试', () => {
  // let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.getTokenAndGlobal()],
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
    // const result = await request(app.getHttpServer()).get('/api/test/token')
    // console.log(result.text) // {"token":4000,"global":4000}
    return request(app.getHttpServer())
      .get('/api/test/token')
      .expect(200)
      .expect({
        token: 4000,
        global: 5000,
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
