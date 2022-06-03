/**S
 * Create by CC on 2022/6/3
 * api接口的全局中间件
 */
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import {
  CodeEnum,
  GlobalService,
  Utils,
  Session_Expires,
  RequestSession,
} from '../common';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  @Inject()
  private globalService: GlobalService;

  async use(req: RequestSession, res: Response, next: NextFunction) {
    if (!Utils.isHasJsonHeader(req)) {
      return res.send({
        code: CodeEnum.INVALID_HEADERS,
        msg: this.globalService.serverLang(
          '缺少content-type头信息',
          'user.invContent',
        ),
      });
    }
    if (!Utils.isHasRequestedHeader(req)) {
      return res.send({
        code: CodeEnum.INVALID_HEADERS,
        msg: this.globalService.serverLang(
          '缺少x-requested-with头信息',
          'user.invRequest',
        ),
      });
    }
    const adminSession = req.session.adminSession;
    if (!adminSession) {
      await this.deleteSession(req);
      return res.send({
        code: CodeEnum.INVALID_SESSION,
        msg: this.globalService.serverLang('无效的凭证', 'user.invSession'),
      });
    }
    const currentDate = new Date();
    //这里不整合这2个判断条件是因为第一个条件不满足时,第二个条件无法获取expires值
    if (currentDate.getTime() - adminSession.expires > Session_Expires) {
      await this.deleteSession(req);
      return res.send({
        code: CodeEnum.SESSION_EXPIRED,
        msg: this.globalService.serverLang('凭证过期', 'user.sessionExp'),
      });
    }
    if (adminSession.isFirstLogin) {
      // 如果用户第一次登录,但是没有去修改密码,所有接口都不能使用
      // 考虑前端的调用roles接口看看是否有问题
      return res.send({
        code: CodeEnum.FIRST_LOGIN,
        msg: this.globalService.serverLang(
          '用户第一次登录，请修改密码',
          'user.isFirstLogin',
        ),
      });
    }
    // 每次访问延长用户有效期时间
    req.session.adminSession.expires = currentDate.getTime() + Session_Expires;
    next();
  }

  private deleteSession(req: RequestSession): Promise<void> {
    delete req.session;
    return new Promise((resolve) => {
      req.sessionStore.destroy(req.sessionID, () => {
        resolve();
      });
    });
  }
}
