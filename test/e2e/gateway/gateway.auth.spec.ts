/**
 * Create by CC on 2022/8/15
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import * as request from 'supertest';
import { TokenService } from '@/gateway';
import { ConfigService } from '@/common/config';
import { Utils } from '@/common/utils';
import * as CryptoJS from 'crypto-js';

describe('GatewayAuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  // let refreshToken: string;
  // const delay = (time: number) =>
  //   new Promise((resolve) => setTimeout(() => resolve(''), time));
  let tokenService: TokenService;
  let configService: ConfigService;
  let accessExpires: number;
  let refreshExpires: number;
  const securitySession = {
    code: 1000,
    sessionId: '',
    accessKey: '',
    vectorValue: '',
  };
  let publicKey: string;

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

  it('获取公钥', () => {
    return request(app.getHttpServer())
      .get('/cms/api/user/publicKey')
      .expect(200)
      .expect((resp) => {
        const body = resp.body;
        expect(body.code).toEqual(1000);
        publicKey = body.publicKey;
      });
  });

  it('/gateway/api/oauth/authorize oauth授权测试', async () => {
    await request(app.getHttpServer())
      .post('/cms/api/user/getSecuritySession')
      .expect(200)
      .expect((resp) => {
        const body = resp.body;
        expect(body.code).toEqual(1000);
        securitySession.sessionId = body.sessionId;
        securitySession.accessKey = body.accessKey;
        securitySession.vectorValue = body.vectorValue;
      });
    const password =
      '043a718774c572bd8a25adbeb1bfcd5c0256ae11cecf9f9c3f925d0e52beaf89';
    const tripleKey = CryptoJS.lib.WordArray.random(32).toString();
    const iv = CryptoJS.lib.WordArray.random(12).toString();
    const tripleKeyParams =
      tripleKey.slice(0, 32) + securitySession.accessKey.slice(32, 64);
    const ivParams =
      iv.slice(0, 12) + securitySession.vectorValue.slice(12, 24);
    const triplePassword = Utils.tripleDesEncrypt(
      password,
      tripleKeyParams,
      ivParams,
    );
    const securityToken = Utils.rsaPublicEncrypt(
      JSON.stringify({
        accessKey: tripleKey,
        vectorValue: iv,
      }),
      Buffer.from(publicKey, 'base64').toString(),
    );
    return request(app.getHttpServer())
      .post('/gateway/api/oauth/authorize')
      .set('security-token', securityToken)
      .set('security-id', securitySession.sessionId)
      .send({
        adminId: 'oliver',
        adminPws: triplePassword,
      })
      .expect(200)
      .expect((resp) => {
        const body = resp.body;
        expect(body.code).toEqual(1000);
        expect(body.accessToken).not.toBeNull();
        expect(body.refreshToken).not.toBeNull();
        const accessSession = tokenService.verifyToken('ZH', body.accessToken);
        const refreshSession = tokenService.verifyToken(
          'ZH',
          body.refreshToken,
        );
        expect(accessSession.expires).toBeUndefined();
        expect(refreshSession.expires).not.toBeNull();
        expect(accessSession.exp - accessSession.iat).toBe(accessExpires);
        expect(refreshSession.exp - refreshSession.iat).toBe(refreshExpires);
        expect(refreshSession.expires).toBe(refreshExpires);
        accessToken = body.accessToken;
        // refreshToken = body.refreshToken;
      });
  });

  it('/gateway/api/oauth/refreshToken 刷新token测试', async () => {
    // 测试使用accessToken当refreshToken刷新时应该无效
    await request(app.getHttpServer())
      .post('/gateway/api/oauth/refreshToken')
      .send({
        refreshToken: accessToken,
      })
      .expect((resp) => {
        expect(resp.body.code).toBe(1010);
      });
    await request(app.getHttpServer())
      .post('/gateway/api/oauth/refreshToken')
      .send({
        refreshToken: 'clothingShop',
      })
      .expect((resp) => {
        expect(resp.body.code).toBe(1010);
      });
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
