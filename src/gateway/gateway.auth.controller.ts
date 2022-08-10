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
import {
  ApiCommon,
  ApiCustomResponse,
  CodeEnum,
  LoginResult,
  CmsSession,
  Utils,
  RequestSession,
  ConfigService,
  GlobalService,
} from '@/common';
import { RespJwtTokenDto, ReqRefreshTokenDto } from './dto';
import { UserService, ReqUserLoginDto } from '@/user';
import { TokenService } from './services';
import { Admin } from '@/entities';

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
    };
    const accessExpires = this.configService.get<number>('tokenExpires', 3600);
    const refreshExpires = this.configService.get<number>('tokenRefresh', 7200);
    resp.accessToken = this.tokenService.generateToken(session, accessExpires);
    // 这里refreshToken加入一个字段标识是refreshToken,用于和accessToken区分开来
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
    // iat是开始时间 exp是结束时间
    const { iat, exp, expires, ...result } = this.tokenService.verifyToken(
      params.refreshToken,
    ); // 如果有返回值,说明token有效
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
      resp.accessToken = this.tokenService.generateToken(
        result,
        iat + accessExpires - nowExpires,
      );
      resp.refreshToken = params.refreshToken;
      return resp;
    }
    // accessToken过期了才会去真的更新时间
    resp.accessToken = this.tokenService.generateToken(result, accessExpires);
    result.expires = refreshExpires;
    resp.refreshToken = this.tokenService.generateToken(result, refreshExpires);
    return resp;
  }
}
