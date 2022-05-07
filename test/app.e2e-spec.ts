import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/index (GET)', () => {
    return request(app.getHttpServer())
      .get('/index')
      .expect(200)
      // 这个是有问题的,以后再看怎么改吧
      .expect('DOCTYPE html')
  });
});
