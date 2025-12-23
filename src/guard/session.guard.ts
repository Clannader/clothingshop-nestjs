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
import { logoutUrl, RequestSession, Session_Expires } from '@/common';
import { GlobalService, Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';
import { CodeException } from '@/common/exceptions';
import { UserSessionService } from '@/user/user.session.service';
import { RIGHTS_KEY, RIGHTS_KEY_OR, RightsEnum } from '@/rights';

import { AopLogger } from '@/logger';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  private readonly logger = new AopLogger(SessionGuard.name);

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly userSessionService: UserSessionService;

  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req: RequestSession = http.getRequest();
    // const res: Response = http.getResponse();
    const language = Utils.getHeadersLanguage(req);
    if (!Utils.isHasJsonHeader()) {
      throw new CodeException(
        CodeEnum.INVALID_HEADERS,
        this.globalService.lang(
          language,
          '缺少content-type头信息',
          'user.invContent',
        ),
      );
    }
    if (!Utils.isHasRequestedHeader(req)) {
      throw new CodeException(
        CodeEnum.INVALID_HEADERS,
        this.globalService.lang(
          language,
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
        this.globalService.lang(language, '无效的凭证', 'user.invSession'),
      );
    }
    const currentDate = new Date();
    //这里不整合这2个判断条件是因为第一个条件不满足时,第二个条件无法获取expires值
    if (currentDate.getTime() - adminSession.expires > Session_Expires) {
      await this.userSessionService.deleteSession(req);
      throw new CodeException(
        CodeEnum.SESSION_EXPIRED,
        this.globalService.lang(language, '凭证过期', 'user.sessionExp'),
      );
    }
    if (adminSession.isFirstLogin && req.url !== logoutUrl) {
      // 如果用户第一次登录,但是没有去修改密码,所有接口都不能使用
      // 考虑前端的调用roles接口看看是否有问题
      throw new CodeException(
        CodeEnum.FIRST_LOGIN,
        this.globalService.lang(
          language,
          '用户第一次登录，请修改密码',
          'user.isFirstLogin',
        ),
      );
    }
    // 每次访问延长用户有效期时间
    req.session.adminSession.expires = currentDate.getTime() + Session_Expires;
    // 先取class上面的权限,如果没有再判断method上面的权限值
    // const classRights = this.reflector.get<number[]>(
    //   RIGHTS_KEY,
    //   context.getClass(),
    // )
    // this.logger.log(classRights);
    // // 下面取method上面的权限值,判断是否有权限进入路由
    // const methodRights = this.reflector.get<number[]>(
    //   RIGHTS_KEY,
    //   context.getHandler(),
    // );
    // this.logger.log(methodRights);
    // 如果想class和method合并再一起,这样写
    const mergeRights = this.reflector.getAllAndMerge<string[]>(RIGHTS_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);
    // 或者(只要有其一就可以通过)
    const orRights = this.reflector.getAllAndMerge<string[]>(RIGHTS_KEY_OR, [
      context.getClass(),
      context.getHandler(),
    ]);
    const sessionRights = JSON.parse(
      Utils.tripleDesDecrypt(
        adminSession.encryptRights,
        adminSession.credential,
      ),
    );
    this.logger.log(`mergeRights: ${mergeRights}`);
    this.logger.log(`orRights: ${orRights}`);
    this.logger.log(`sessionRights: ${sessionRights}`);
    // 如果接口没有设置权限就放行
    const [notExistRights, isHasRightsFlag] = this.globalService.userHasRights(
      sessionRights,
      ...(<RightsEnum[]>mergeRights),
    );
    if (mergeRights.length !== 0 && !isHasRightsFlag) {
      throw new CodeException(
        CodeEnum.NO_RIGHTS,
        this.globalService.lang(
          language,
          '用户{0}缺少所需权限{1}.',
          'common.hasNoPermissions',
          adminSession.adminId,
          `${notExistRights.join(',')}`,
        ),
      );
    }

    if (
      orRights.length !== 0 &&
      !Utils.hasOrRights(sessionRights, ...(<RightsEnum[]>orRights))
    ) {
      throw new CodeException(
        CodeEnum.NO_RIGHTS,
        this.globalService.lang(
          language,
          '用户{0}缺少所需权限{1}.',
          'common.hasNoPermissions',
          adminSession.adminId,
          `${orRights.join(',')}`,
        ),
      );
    }
    return true;
  }
}
