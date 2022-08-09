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
    const expires = this.configService.get<number>('tokenExpires', 60);
    const refreshExpires = this.configService.get<number>('tokenRefresh', 120);
    resp.accessToken = this.tokenService.generateToken(session, expires);
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
    const { iat, exp, ...result } = this.tokenService.verifyToken(
      params.refreshToken,
    ); // 如果有返回值,说明token有效
    const resp = new RespJwtTokenDto();
    const expires = this.configService.get<number>('tokenExpires', 60);
    const refreshExpires = this.configService.get<number>('tokenRefresh', 120);
    resp.accessToken = this.tokenService.generateToken(result, expires);
    resp.refreshToken = this.tokenService.generateToken(result, refreshExpires);
    return resp;
  }
}
