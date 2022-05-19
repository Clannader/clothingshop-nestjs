/**
 * Create by CC on 2022/5/18
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/config/app.module';
import { ConfigService } from '../../../src/common/config';
import * as request from 'supertest';

describe('ConfigService token测试', () => {
  let service: ConfigService;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.getTokenIni()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>('TOKEN');
  });

  it(`ConfigService 获取ini`, () => {
    expect(service).toBeDefined();
    return request(app.getHttpServer())
      .get('/api/test/search')
      .expect(200)
      .expect('5000');
  });


  afterEach(async () => {
    await app.close();
  });
});
