/**
 * Create by CC on 2022/8/18
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { RequestSession } from '@/common';
import { GlobalService, Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';
import { CodeException } from '@/common/exceptions';
import { forEach, get } from 'lodash';
import { UserSessionService } from '@/user/user.session.service';
import { Reflector } from '@nestjs/core';
import { AopLogger } from '@/logger';
import { RIGHTS_KEY, RIGHTS_KEY_OR, RightsEnum } from '@/rights';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  private readonly logger = new AopLogger(JwtGuard.name);

  @Inject()
  private readonly userSessionService: UserSessionService;

  @Inject()
  private readonly globalService: GlobalService;

  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req: RequestSession = http.getRequest();
    const authHeader =
      typeof req.headers['authorization'] === 'string'
        ? req.headers['authorization']
        : '';
    const language = Utils.getHeadersLanguage(req);
    if (Utils.isEmpty(authHeader)) {
      throw new CodeException(
        CodeEnum.INVALID_HEADERS,
        this.globalService.lang(
          language,
          '缺少Authorization请求头',
          'user.missAuthRequest',
        ),
      );
    }

    const matches = authHeader.match(/(\S+)\s+(\S+)/);
    if (!matches) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的授权', 'user.invalidAuth'),
      );
    }
    const [, name, value] = matches;
    if ('bearer' !== name.toLowerCase()) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的授权', 'user.invalidAuth'),
      );
    }
    const { /*iat, exp, */ expires, ...jwtSession } =
      this.userSessionService.verifyToken(language, value);
    delete jwtSession.iat;
    delete jwtSession.exp;
    if (!Utils.isEmpty(expires)) {
      // 如果expires不为空,说明使用的是refreshToken进来,不能访问业务
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
      );
    }
    // 这里还要校验jwtSession里面的值
    const validFields = [
      'adminId',
      'adminName',
      'adminType',
      'mobile',
      'loginTime',
      'lastTime',
      'shopId',
      'requestIP',
      'requestHost',
      'isFirstLogin',
      'sessionId',
    ];
    forEach(validFields, (v) => {
      if (Utils.isEmpty(get(jwtSession, v))) {
        throw new CodeException(
          CodeEnum.INVALID_TOKEN,
          this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
        );
      }
    });
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
      Utils.tripleDesDecrypt(jwtSession.encryptRights, jwtSession.sessionId),
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
          jwtSession.adminId,
          `${notExistRights.join(',')}`,
        ),
      );
    }
    const [notOrRights, isOrRightsFlag] = this.globalService.userHasOrRights(
      sessionRights,
      ...(<RightsEnum[]>orRights),
    );
    if (orRights.length !== 0 && !isOrRightsFlag) {
      throw new CodeException(
        CodeEnum.NO_RIGHTS,
        this.globalService.lang(
          language,
          '用户{0}缺少所需权限{1}.',
          'common.hasNoPermissions',
          jwtSession.adminId,
          `${notOrRights.join(',')}`,
        ),
      );
    }
    return true;
  }
}
