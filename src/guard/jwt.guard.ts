/**
 * Create by CC on 2022/8/18
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TokenService } from '@/gateway';
import { CodeEnum, CodeException, GlobalService, RequestSession, Utils } from '@/common';
import { forEach, get } from 'lodash'

@Injectable()
export class JwtGuard implements CanActivate {

  @Inject()
  private tokenService: TokenService

  @Inject()
  private globalService: GlobalService;

  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req: RequestSession = http.getRequest();
    const authHeader = req.headers['authorization'] as string
    if (Utils.isEmpty(authHeader)) {
      throw new CodeException(
        CodeEnum.INVALID_HEADERS,
        this.globalService.serverLang(
          '缺少Authorization请求头',
          'user.missAuthRequest',
        ),
      );
    }

    const matches = authHeader.match(/(\S+)\s+(\S+)/);
    if (!matches) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.serverLang(
          '无效的授权',
          'user.invalidAuth',
        ),
      );
    }
    const [name, value] = matches
    if ('bearer' !== name.toLowerCase()) {
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.serverLang(
          '无效的授权',
          'user.invalidAuth',
        ),
      );
    }
    const { iat, exp, expires, ...jwtSession } = this.tokenService.verifyToken(
      value
    );
    if (!Utils.isEmpty(expires)) {
      // 如果expires不为空,说明使用的是refreshToken进来,不能访问业务
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.serverLang('无效的Token', 'user.tokenInvalid'),
      );
    }
    // 这里还要校验jwtSession里面的值
    const validFields = ['adminId', 'adminName', 'adminType', 'mobile', 'loginTime'
    , 'lastTime', 'shopId', 'requestIP', 'requestHost', 'isFirstLogin', 'sessionId']
    forEach(validFields, v => {
      if (!get(jwtSession, v)) {
        throw new CodeException(
          CodeEnum.INVALID_TOKEN,
          this.globalService.serverLang('无效的Token', 'user.tokenInvalid'),
        );
      }
    })
    return true;
  }
}
