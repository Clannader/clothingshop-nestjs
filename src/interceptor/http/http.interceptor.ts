import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
  Inject,
} from '@nestjs/common';
import {
  Utils,
  RequestSession,
  CodeEnum,
  Session_Expires,
  logoutUrl,
  GlobalService,
  CodeException,
} from '@/common';
import { UserService } from '@/user';
// import { Response } from 'express';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  @Inject()
  private globalService: GlobalService;

  @Inject()
  private userService: UserService;

  async intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const req: RequestSession = http.getRequest();
    // const res: Response = http.getResponse();
    if (!Utils.isHasJsonHeader(req)) {
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
      await this.userService.deleteSession(req);
      throw new CodeException(
        CodeEnum.INVALID_SESSION,
        this.globalService.serverLang('无效的凭证', 'user.invSession'),
      );
    }
    const currentDate = new Date();
    //这里不整合这2个判断条件是因为第一个条件不满足时,第二个条件无法获取expires值
    if (currentDate.getTime() - adminSession.expires > Session_Expires) {
      await this.userService.deleteSession(req);
      throw new CodeException(
        CodeEnum.SESSION_EXPIRED,
        this.globalService.serverLang('凭证过期', 'user.sessionExp'),
      );
    }
    if (adminSession.isFirstLogin && req.baseUrl !== logoutUrl) {
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
    return next.handle();
  }
}
