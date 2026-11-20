/**
 * Create by oliver.wu 2025/2/27
 */
// nestjs
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@andybeat/swagger';
// third party
import { Response } from 'express';
// common
import { ApiTagsController } from '@/common/decorator';
import { RequestSession } from '@/common';
import { Utils } from '@/common/utils';
// service
import { UserService } from '@/user';
// other
import { SamlAuthGuard } from '@/guard';
import { RespUserLoginDto } from '@/user/dto';

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
  @UseGuards(SamlAuthGuard)
  ssoLogin(@Res() res: Response, @Query() params: Record<string, any>) {
    // 前端调用
    // window.location.href = `/sso/login?email=${encodeURIComponent(paramsObject.userid)}&version=3`
    // email为邮箱地址,其他参数：version为内部自定义参数,控制业务使用
    // [单点登录传参:第二步]跳转页面时取值,调整业务
    const email = params.email;
    const version = params.version; // 可以通过这个参数跳转不同的index
    res.redirect('/index'); // 其实这个重定向没什么作用,会直接跳转到微软的登录界面
  }

  @Post('/login/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SSO登录后回调',
    description: 'SSO登录后回调',
  })
  @UseGuards(SamlAuthGuard)
  async ssoLoginCallback(@Req() req: RequestSession, @Res() res: Response, @Body() params: Record<string, any>) {
    // RelayState 是登录时,给 IdP 带的version值, Azure 认证后原样带回,属不可信输入,白名单判断
    // const basePath: string = req.body?.RelayState
    // [单点登录传参:第三步]回调时取值
    const basePath: string = params?.RelayState // 为/sso/login的version参数值
    // 如果微软校验通过,app认证用户存在则req.user有值
    // 如果有任何错误,直接抛出异常得了
    const authUser = req.user;
    if (authUser.errorMsg) {
      const resp = new RespUserLoginDto();
      resp.code = authUser.errorMsg.code;
      resp.msg = authUser.errorMsg.message;
      const errorMessage = Utils.base64ToString(JSON.stringify(resp));
      // +号转义成%2B
      // /号转义成%2F
      return res.redirect(
        `/login?errorMessage=${errorMessage.replace(/\+/g, '%2B').replace(/\//g, '%2F')}`,
      );
    }
    // 这里拿到了返回的session信息后,需要重定向到前端页面
    // 例如: res.redirect('/ssoLogin?token=xxx'),加密后的token给前端解析即可
    // 参考老版本前端代码的路由免登录逻辑
    // https://github.com/Clannader/clothingshop/blob/74275f97ce24a6920a9b6b76a615d1661eded734/src/router/index.js#L98-L102
    const result = await this.userService.regenerateUserSession(req, authUser);
    const successMessage = Utils.base64ToString(JSON.stringify(result));
    return res.redirect(
      `/login?token=${successMessage.replace(/\+/g, '%2B').replace(/\//g, '%2F')}`,
    );
  }
}
