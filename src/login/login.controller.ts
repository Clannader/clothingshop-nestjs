import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommon,
  ApiCustomResponse,
  CommonResult,
  RequestSession,
} from '@/common';
import { UserService, ReqUserLoginDto, RespUserLoginDto } from '@/user';
import { HttpInterceptor } from '@/interceptor';

@Controller('/cms/api/user')
@ApiTags('LoginController')
export class LoginController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '登录系统',
    description: '获取系统的凭证',
  })
  @ApiCustomResponse({
    type: RespUserLoginDto,
  })
  @ApiCommon(false)
  userLogin(@Body() params: ReqUserLoginDto, @Req() req: RequestSession) {
    return this.userService.userLogin(params, req);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '退出系统',
    description: '删除系统的凭证',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiCommon()
  @UseInterceptors(HttpInterceptor)
  userLogout(@Req() req: RequestSession) {
    return this.userService.userLogout(req);
  }
}
