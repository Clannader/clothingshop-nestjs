/**
 * Create by CC on 2022/8/9
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Inject,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginResult, CmsSession, RequestSession } from '@/common';
import { ApiCommon, ApiCustomResponse } from '@/common/decorator';
import { CodeEnum } from '@/common/enum';
import { ConfigService } from '@/common/config';
import { Utils, GlobalService } from '@/common/utils';
import { RespJwtTokenDto, ReqRefreshTokenDto } from '../dto';
import { UserService } from '@/user';
import { ReqUserLoginDto } from '@/user/dto';
import { TokenService } from '../services';
import { Admin } from '@/entities/schema';
import { TokenCacheService } from '@/cache/services';

@ApiCommon({ showCredential: false })
@Controller('/gateway/api/oauth')
@ApiTags('GatewayAuthController')
export class GatewayAuthController {
  @Inject()
  private readonly userService: UserService;

  @Inject()
  private readonly tokenService: TokenService;

  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly tokenCacheService: TokenCacheService;

  @Post('/authorize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '接口授权验证',
    description: '获取JWT的token',
  })
  @ApiCustomResponse({
    type: RespJwtTokenDto,
  })
  async authorizeLogin(
    @Body() params: ReqUserLoginDto,
    @Req() req: RequestSession,
  ) {
    params.allowThirdUser = true;
    const result: LoginResult = await this.userService.userLogin(params);
    const resp = new RespJwtTokenDto();
    if (result.code !== CodeEnum.SUCCESS) {
      resp.code = result.code;
      resp.msg = result.message;
      return resp;
    }
    const admin: Admin = result.adminInfo;
    const currentDate: Date = result.currentDate;
    const otherInfo = result.otherInfo;
    const session: CmsSession = {
      adminId: admin.adminId,
      adminName: admin.adminName,
      adminType: admin.adminType,
      mobile: false,
      loginTime: currentDate,
      // expires: this.configService.get<number>('tokenExpires', 60),
      lastTime: admin.loginTime || currentDate,
      shopId: otherInfo.currentShop,
      requestIP: Utils.getRequestIP(req),
      requestHost: req.headers['host'],
      isFirstLogin: false,
      sessionId: Utils.getUuid(),
    };
    const accessExpires = this.configService.get<number>('tokenExpires', 3600);
    const refreshExpires = this.configService.get<number>('tokenRefresh', 7200);
    resp.accessToken = this.tokenService.generateToken(session, accessExpires);
    // 这里refreshToken加入一个字段,标识是这个token是refreshToken,用于和accessToken区分开来
    // 避免有人使用refreshToken当成accessToken来访问
    session.expires = refreshExpires;
    resp.refreshToken = this.tokenService.generateToken(
      session,
      refreshExpires,
    );
    return resp;
  }

  @Post('/refreshToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新JWT凭证',
    description: 'Token过期时可以获取一个新的JWT token',
  })
  @ApiCustomResponse({
    type: RespJwtTokenDto,
  })
  async refreshToken(@Body() params: ReqRefreshTokenDto) {
    // iat是开始时间 exp是结束时间, expires是session里面的有效期,只有refreshToken里面才会有值
    const { iat, /*exp, */ expires, ...result } = this.tokenService.verifyToken(
      params.refreshToken,
    );
    delete result.exp;
    // 如果有返回值,说明token有效
    const resp = new RespJwtTokenDto();
    // 只有result.expires > 0 才是refreshToken
    // 不允许使用accessToken来刷新
    const accessExpires = this.configService.get<number>('tokenExpires', 3600);
    const nowExpires = Math.floor(Date.now() / 1000); // 当前时间的秒数
    if (Utils.isEmpty(expires)) {
      // 如果expires是空的说明传进来的是accessToken,不能刷新token
      resp.code = CodeEnum.INVALID_TOKEN;
      resp.msg = this.globalService.serverLang(
        '无效的Token',
        'user.tokenInvalid',
      );
      return resp;
    }
    // 如果是refreshToken,需要判断refreshToken对应的accessToken有没有过期
    // 如果没有过期,则不重新刷新token
    const refreshExpires = this.configService.get<number>('tokenRefresh', 7200);
    if (iat + accessExpires > nowExpires) {
      // 开始时间加有效期还是大于现在时间说明没有过期
      // 生成一个减少有效期的accessToken,因为需要减去之前流过的时间,避免产生多个accessToken时
      // 恶意访问服务器
      resp.accessToken = this.tokenService.generateToken(
        result,
        iat + accessExpires - nowExpires,
      );
      // refreshToken原样返回
      resp.refreshToken = params.refreshToken;
      return resp;
    }
    // accessToken过期了才会去真的更新时间
    // 这里使用内存限制每个refreshToken只能刷新一次,第二次刷新无效,避免恶意刷新token导致
    // 生成多个token,由于有多台服务器的原因,内存同步问题,思考过了,不需要同步内存,如果进到了另一台
    // 没有内存的服务器,也可以让他重新生成一个新的token,反正也最多生成和服务器数量一致的token
    // 也不至于目前这种可以产生多个新的token.并且内存管理以后要是使用radis的话,就可以控制生成一个了

    // 这里第一步通过解析出来的sessionId,从内存中获取refreshToken,如果没有,则正常生成,如果有,则返回token无效,禁止多次刷新
    const cacheToken = await this.tokenCacheService
      .getTokenCache(result.sessionId)
      .then((result) => result);
    if (cacheToken) {
      resp.code = CodeEnum.INVALID_TOKEN;
      resp.msg = this.globalService.serverLang(
        '无效的Token',
        'user.tokenInvalid',
      );
      return resp;
    }
    this.tokenCacheService.setTokenCache(result.sessionId, params.refreshToken);
    resp.accessToken = this.tokenService.generateToken(result, accessExpires);
    result.expires = refreshExpires;
    resp.refreshToken = this.tokenService.generateToken(result, refreshExpires);
    return resp;
  }
}
