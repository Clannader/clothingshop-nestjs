/**
 * Create by oliver.wu 2025/2/27
 */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ApiTagsController } from '@/common/decorator';
import { ApiOperation } from '@nestjs/swagger';
import { RequestSession } from '@/common';
import { UserService } from '@/user';

@Controller('/sso')
@ApiTagsController('SamlAuthController', 'SSO登录模块')
export class SamlAuthController {
  @Inject()
  private readonly userService: UserService;

  @Get('/login')
  @ApiOperation({
    summary: 'SSO登录跳转',
    description: 'SSO登录跳转',
  })
  @UseGuards(AuthGuard('saml'))
  ssoLogin(@Res() res: Response) {
    res.redirect('/index'); // 其实这个重定向没什么作用,会直接跳转到微软的登录界面
  }

  @Post('/login/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SSO登录后回调',
    description: 'SSO登录后回调',
  })
  @UseGuards(AuthGuard('saml'))
  async ssoLoginCallback(@Req() req: RequestSession) {
    // 如果微软校验通过,app认证用户存在则req.user有值
    // 如果有任何错误,直接抛出异常得了
    const authUser = req.user;
    return this.userService.regenerateUserSession(req, authUser);
  }
}
