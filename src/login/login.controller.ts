import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Req,
  UseInterceptors,
  UseGuards,
  Inject,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CommonResult,
  RequestSession,
  sessionSecret,
  LoginResult,
  LanguageType,
  RespPublicKeyResultDto,
  RespSecuritySessionDto,
  SecurityOptions,
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
import { MemoryCacheService } from '@/cache/services';
import { SecuritySessionService, SecuritySessionStorage } from '@/security';

@Controller('/cms/api/user')
@ApiTags('LoginController')
export class LoginController {
  @Inject()
  private readonly userService: UserService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  @Inject()
  private readonly securitySessionService: SecuritySessionService;

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '登录系统',
    description: '获取系统的凭证',
  })
  @ApiCustomResponse({
    type: RespUserLoginDto,
  })
  @ApiCommon({ showCredential: false, showRsaToken: true })
  async userLogin(
    @Body() params: ReqUserLoginDto,
    @Req() req: RequestSession,
    @UserLanguage() language: LanguageType,
    @Headers('Security-Token') securityToken: string,
    @Headers('Security-Id') securityId: string,
  ) {
    const securityOptions: SecurityOptions = {
      securityToken,
      securityId,
    };
    const result: LoginResult = await this.userService.userLogin(
      language,
      params,
      securityOptions,
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

  @Get('/publicKey')
  @ApiOperation({
    summary: '获取系统公钥',
    description: '获取系统公钥',
  })
  @ApiCustomResponse({
    type: RespPublicKeyResultDto,
  })
  @ApiCommon({ showCredential: false })
  async getUserPublicKey() {
    const resp = new RespPublicKeyResultDto();
    resp.publicKey = await this.memoryCacheService.getRsaPublicKey();
    return resp;
  }

  @Post('/getSecuritySession')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取一个安全会话',
    description: '获取安全会话的相关数据',
  })
  @ApiCustomResponse({
    type: RespSecuritySessionDto,
  })
  @ApiCommon({ showCredential: false })
  async getUserSecuritySession() {
    const storage: SecuritySessionStorage =
      await this.securitySessionService.getNewSessionStorage();
    const resp = new RespSecuritySessionDto();
    resp.sessionId = storage.sessionId;
    resp.accessKey = storage.accessKey;
    resp.vectorValue = storage.vectorValue;
    return resp;
  }
}
