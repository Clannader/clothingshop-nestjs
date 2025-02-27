/**
 * Create by oliver.wu 2025/2/27
 */
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ApiTagsController } from '@/common/decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('/sso')
@ApiTagsController('SamlAuthController', 'SSO登录模块')
export class SamlAuthController {
  @Get('/login')
  @ApiOperation({
    summary: 'SSO登录跳转',
    description: 'SSO登录跳转',
  })
  @UseGuards(AuthGuard('saml'))
  ssoLogin(@Res() res: Response) {
    res.redirect('/index'); // 其实这个重定向没什么作用
  }

  @Post('/login/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SSO登录后回调',
    description: 'SSO登录后回调',
  })
  @UseGuards(AuthGuard('saml'))
  ssoLoginCallback(@Req() req: Request, @Res() res: Response) {
    if (req.user) {
      req.login(req.user, (err) => {
        if (err) {
          res.status(500).json({ message: 'Error logging in', error: err });
        } else {
          res.redirect('/');
        }
      });
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
}
