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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/gateway/api/oauth/authorize oauth授权测试', () => {
    console.log(Date.now());
    const tokenService = app.get<TokenService>(TokenService);
    const configService = app.get<ConfigService>(ConfigService);
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
        const accessExpires = configService.get<number>('tokenExpires', 3600);
        const refreshExpires = configService.get<number>('tokenRefresh', 7200);
        expect(accessSession.exp - accessSession.iat).toBe(accessExpires);
        expect(refreshSession.exp - refreshSession.iat).toBe(refreshExpires);
        expect(refreshSession.expires).toBe(refreshExpires);
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
      });
  });

  it('/gateway/api/oauth/refreshToken 刷新token测试', () => {
    console.log(accessToken);
    console.log(refreshToken);
  });

  afterEach(async () => {
    await app.close();
  });
});
