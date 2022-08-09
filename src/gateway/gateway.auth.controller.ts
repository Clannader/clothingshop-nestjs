/**
 * Create by CC on 2022/8/9
 */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse, CodeEnum, LoginResult } from '@/common';
import { RespJwtToken, ReqRefreshToken } from './dto';
import { UserService, ReqUserLoginDto } from '@/user';

@ApiCommon({ showCredential: false })
@Controller('/gateway/api/oauth')
@ApiTags('GatewayAuthController')
export class GatewayAuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/authorize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '接口授权验证',
    description: '获取JWT的token',
  })
  @ApiCustomResponse({
    type: RespJwtToken,
  })
  async authorizeLogin(@Body() params: ReqUserLoginDto) {
    const result: LoginResult = await this.userService.userLogin(params);
    const resp = new RespJwtToken();
    if (result.code !== CodeEnum.SUCCESS) {
      resp.code = result.code;
      resp.msg = result.message;
      return resp;
    }
    resp.accessToken = 'sfdfsd';
    return resp;
  }

  @Post('/refreshToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新JWT凭证',
    description: 'Token过期时可以获取一个新的JWT token',
  })
  @ApiCustomResponse({
    type: RespJwtToken,
  })
  async refreshToken(@Body() params: ReqRefreshToken) {
    const resp = new RespJwtToken();
    resp.accessToken = 'sfdfsd';
    return resp;
  }
}
