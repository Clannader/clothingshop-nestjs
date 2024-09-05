/**
 * Create by CC on 2022/7/20
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  logoutUrl,
  RequestSession,
  Session_Expires,
} from '@/common';
import {
  GlobalService,
  Utils,
} from '@/common/utils';
import {
  CodeEnum,
} from '@/common/enum';
import {
  CodeException,
} from '@/common/exceptions';
import { UserSessionService } from '@/user/user.session.service';
import { RIGHTS_KEY } from '@/rights';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  @Inject()
  private globalService: GlobalService;

  @Inject()
  private userSessionService: UserSessionService;

  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req: RequestSession = http.getRequest();
    // const res: Response = http.getResponse();
    if (!Utils.isHasJsonHeader()) {
      throw new CodeException(
        CodeEnum.INVALID_HEADERS,
        this.globalService.serverLang(
          '缺少content-type头信息',
          'user.invContent',
        ),
      );
    }
    if (!Utils.isHasRequestedHeader(req)) {
      throw new CodeException(
        CodeEnum.INVALID_HEADERS,
        this.globalService.serverLang(
          '缺少x-requested-with头信息',
          'user.invRequest',
        ),
      );
    }
    const adminSession = req.session.adminSession;
    if (!adminSession) {
      await this.userSessionService.deleteSession(req);
      throw new CodeException(
        CodeEnum.INVALID_SESSION,
        this.globalService.serverLang('无效的凭证', 'user.invSession'),
      );
    }
    const currentDate = new Date();
    //这里不整合这2个判断条件是因为第一个条件不满足时,第二个条件无法获取expires值
    if (currentDate.getTime() - adminSession.expires > Session_Expires) {
      await this.userSessionService.deleteSession(req);
      throw new CodeException(
        CodeEnum.SESSION_EXPIRED,
        this.globalService.serverLang('凭证过期', 'user.sessionExp'),
      );
    }
    if (adminSession.isFirstLogin && req.url !== logoutUrl) {
      // 如果用户第一次登录,但是没有去修改密码,所有接口都不能使用
      // 考虑前端的调用roles接口看看是否有问题
      throw new CodeException(
        CodeEnum.FIRST_LOGIN,
        this.globalService.serverLang(
          '用户第一次登录，请修改密码',
          'user.isFirstLogin',
        ),
      );
    }
    // 每次访问延长用户有效期时间
    req.session.adminSession.expires = currentDate.getTime() + Session_Expires;
    // 判断是否有权限进入路由
    const rights = this.reflector.get<number[]>(
      RIGHTS_KEY,
      context.getHandler(),
    );

    // 如果接口没有设置权限就放行
    if (!rights) {
      return true;
    }
    // TODO 这里判断权限,注意权限值是数字类型的,需要转换一下
    return true;
  }
}
