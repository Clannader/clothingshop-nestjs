/**
 * Create by CC on 2022/8/15
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import * as request from 'supertest';
import { TokenService } from '@/gateway';
import { ConfigService } from '@/common';

describe('GatewayAuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  // const delay = (time: number) =>
  //   new Promise((resolve) => setTimeout(() => resolve(''), time));
  let tokenService: TokenService;
  let configService: ConfigService;
  let accessExpires: number;
  let refreshExpires: number;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    tokenService = app.get<TokenService>(TokenService);
    configService = app.get<ConfigService>(ConfigService);
    accessExpires = configService.get<number>('tokenExpires', 3600);
    refreshExpires = configService.get<number>('tokenRefresh', 7200);
  });

  it('/gateway/api/oauth/authorize oauth授权测试', () => {
    return request(app.getHttpServer())
      .post('/gateway/api/oauth/authorize')
      .send({
        adminId: 'oliver',
        adminPws:
          '043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89',
      })
      .expect(200)
      .expect((resp) => {
        const body = resp.body;
        expect(body.code).toEqual(1000);
        expect(body.accessToken).not.toBeNull();
        expect(body.refreshToken).not.toBeNull();
        const accessSession = tokenService.verifyToken(body.accessToken);
        const refreshSession = tokenService.verifyToken(body.refreshToken);
        expect(accessSession.expires).toBeUndefined();
        expect(refreshSession.expires).not.toBeNull();
        expect(accessSession.exp - accessSession.iat).toBe(accessExpires);
        expect(refreshSession.exp - refreshSession.iat).toBe(refreshExpires);
        expect(refreshSession.expires).toBe(refreshExpires);
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
      });
  });

  it('/gateway/api/oauth/refreshToken 刷新token测试', async () => {
    // 测试使用accessToken当refreshToken刷新时应该无效
    await request(app.getHttpServer())
      .post('/gateway/api/oauth/refreshToken')
      .send({
        refreshToken: accessToken
      })
      .expect(resp => {
        expect(resp.body.code).toBe(1010)
      })
    await request(app.getHttpServer())
      .post('/gateway/api/oauth/refreshToken')
      .send({
        refreshToken: 'clothingShop'
      })
      .expect(resp => {
        expect(resp.body.code).toBe(1010)
      })
    // 下面代码无法测试
    // 测试等待10秒后,使用refreshToken刷新时,不改变refreshToken的值,并且减少accessToken的有效期
    // return request(app.getHttpServer())
    //   .post('/gateway/api/oauth/refreshToken')
    //   .send({
    //     refreshToken: refreshToken
    //   })
    //   .expect(200)
    //   .expect(resp => {
    //     expect(resp.body.refreshToken).toBe(refreshToken)
    //     expect(resp.body.accessToken).not.toBe(accessToken)
    //     const accessSession = tokenService.verifyToken(resp.body.accessToken);
    //     expect(accessSession.exp - accessSession.iat).toBe(accessExpires - 10);
    //   })
  });

  afterEach(async () => {
    await app.close();
  });
});
