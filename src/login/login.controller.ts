import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Req,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CommonResult,
  RequestSession,
  sessionSecret,
  LoginResult,
  languageType,
} from '@/common';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';
import { ApiCommon, ApiCustomResponse, UserLanguage } from '@/common/decorator';
import { UserService, UserMapper } from '@/user';
import { ReqUserLoginDto, RespUserLoginDto } from '@/user/dto';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { sign } from 'cookie-signature';
import { Admin } from '@/entities/schema';

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
  @ApiCommon({ showCredential: false })
  async userLogin(
    @Body() params: ReqUserLoginDto,
    @Req() req: RequestSession,
    @UserLanguage() language: languageType,
  ) {
    const result: LoginResult = await this.userService.userLogin(
      language,
      params,
    );
    const resp = new RespUserLoginDto();
    if (result.code !== CodeEnum.SUCCESS) {
      resp.code = result.code;
      resp.msg = result.message;
      return resp;
    }
    //登录成功写log
    //登录时用cookie做默认语言
    const userAgent = (req.headers['user-agent'] as string) || '';
    const store = req.sessionStore;
    const admin: Admin = result.adminInfo;
    const currentDate: Date = result.currentDate;
    const otherInfo = result.otherInfo;
    //重新获取一个新的sessionID
    const getRegenerate = function (): Promise<void> {
      return new Promise((resolve) => {
        store.regenerate(req, function () {
          resolve();
        });
      });
    };
    await getRegenerate();
    const credential = 's:' + sign(req.sessionID, sessionSecret);
    req.session.adminSession = {
      adminId: admin.adminId,
      adminName: admin.adminName,
      adminType: admin.adminType,
      mobile: userAgent.indexOf('Mobile') !== -1,
      //权限这个也可以每次进来的时候查一遍,避免自己权限被别人更改,没有刷新最新的权限
      //以后会考虑压缩数据,加密后存库,使用参数控制
      //还可以避免数据库内存溢出
      // rights: admin.rights,
      loginTime: currentDate, //这个日期如果在网页显示没有错就可以,如果有错就转格式
      expires: currentDate.getTime(), //有效期
      // activeDate: currentDate.getTime(),//活跃时间
      lastTime: admin.loginTime || currentDate, //上次登录时间
      // language: CGlobal.GlobalLangType,//语言
      shopId: otherInfo.currentShop, //当前登录的店铺ID,如果没有@店铺,那么永远都是SYSTEM,如果@了那就是@的那个值
      // shopList: otherInfo.shopList,//该用户能够操作的店铺ID
      // selfShop: otherInfo.selfShop,//用户自己的店铺ID
      // userImg: '/img/default.jpg',
      requestIP: Utils.getRequestIP(req),
      requestHost: req.headers['host'],
      sessionId: req.sessionID,
      credential: credential,
      isFirstLogin: admin.isFirstLogin, // 如果是接口用户估计需要这个字段是false的
      // supplierCode: admin.supplierCode || '',//集团代码
      // shopName: otherInfo.shopName //店铺名,没有@shopId那么就是没有值
    };
    resp.code = CodeEnum.SUCCESS;
    resp.credential = credential;
    resp.session = UserMapper.getTemplateSession(req.session.adminSession);
    resp.expireMsg = result.expireMsg;
    return resp;
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
  @UseGuards(SessionGuard)
  @UseInterceptors(HttpInterceptor)
  userLogout(@Req() req: RequestSession) {
    return this.userService.userLogout(req);
  }
}
