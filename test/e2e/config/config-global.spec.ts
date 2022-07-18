/**
 * Create by CC on 2022/5/18
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import * as request from 'supertest';

describe('ConfigService 测试全局初始化', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.getGlobalIni()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it(`ConfigService 获取ini`, () => {
    return request(app.getHttpServer())
      .get('/api/test/search')
      .expect(200)
      .expect('5000');
  });

  afterEach(async () => {
    await app.close();
  });
});
