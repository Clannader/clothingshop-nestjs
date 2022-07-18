/**
 * Create by CC on 2022/7/17
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/api/test/xxxx (GET) 地址不存在', () => {
    return request(app.getHttpServer())
      .get('/api/test/xxxx')
      .expect(200)
      .expect(res => {
        const body = res.body
        expect(body.code).toEqual(404)
        expect(body.msg).toContain('/api/test/xxxx')
        expect(body.timestamp).toBeDefined()
        expect(body.path).toEqual('/api/test/xxxx')
      });
  });

  it('/api/test/xxxx (POST) 地址不存在', () => {
    return request(app.getHttpServer())
      .post('/api/test/xxxx')
      .expect(200)
      .expect(res => {
        const body = res.body
        expect(body.code).toEqual(404)
        expect(body.msg).toContain('/api/test/xxxx')
        expect(body.timestamp).toBeDefined()
        expect(body.path).toEqual('/api/test/xxxx')
      });
  });

  it('/cms/api/user/search2 (GET) cms前缀地址不存在', () => {
    return request(app.getHttpServer())
      .get('/cms/api/user/search2')
      .expect(200)
      .expect(res => {
        const body = res.body
        expect(body.code).toEqual(404)
        expect(body.msg).toContain('/cms/api/user/search2')
        expect(body.timestamp).toBeDefined()
        expect(body.path).toEqual('/cms/api/user/search2')
      });
  });

  it('/cms/api/user/login (GET) 地址正确,请求方式错误', () => {
    return request(app.getHttpServer())
      .get('/cms/api/user/login')
      .expect(200)
      .expect(res => {
        const body = res.body
        expect(body.code).toEqual(404)
        expect(body.msg).toContain('/cms/api/user/login')
        expect(body.timestamp).toBeDefined()
        expect(body.path).toEqual('/cms/api/user/login')
      });
  });

  it('/cms/api/user/login (POST) 登录接口不传参数', () => {
    return request(app.getHttpServer())
      .post('/cms/api/user/login')
      .expect(500)
      .expect(res => {
        const body = res.body
        console.log(res)
        expect(body.code).toEqual(1005)
        expect(body.msg).toEqual('adminId must be a string')
        expect(body.timestamp).toBeDefined()
        expect(body.path).toEqual('/cms/api/user/login')
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
