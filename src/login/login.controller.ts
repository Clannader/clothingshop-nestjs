import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiCommon,
  ApiCustomResponse,
  CommonResult,
} from '../common';
import { UserService } from '../user/user.service';

@ApiCommon()
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
    type: RespWebConfigDto,
  })
  userLogin() {
    return this.userService.userLogin();
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
  userLogout() {
    return this.userService.userLogout();
  }
}
