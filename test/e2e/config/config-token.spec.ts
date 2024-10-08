/**
 * Create by CC on 2022/5/18
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigTestModule } from '@T/config/config.test.module';
import { ConfigService } from '@/common/config';
import * as request from 'supertest';

describe('ConfigService token测试', () => {
  let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigTestModule.getTokenIni()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>('TOKEN');
  });

  it(`ConfigService 获取ini`, () => {
    expect(service).toBeDefined();
    expect(app.get<ConfigService>(ConfigService)).toBeDefined();
    return request(app.getHttpServer())
      .get('/api/test/token')
      .expect(200)
      .expect({
        token: 5000,
        global: 5000,
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
