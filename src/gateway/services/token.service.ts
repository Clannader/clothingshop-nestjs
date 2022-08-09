/**
 * Create by CC on 2022/8/9
 */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CmsSession, CodeEnum, CodeException, GlobalService } from '@/common';

@Injectable()
export class TokenService {
  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly globalService: GlobalService;

  /**
   * 生成token
   * @param session
   */
  generateToken(session: CmsSession, expired: string | number) {
    return this.jwtService.sign(session, { expiresIn: expired });
  }

  /**
   * 校验token
   * @param token
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch ({ name, message }) {
      if (name === 'TokenExpiredError') {
        throw new CodeException(
          CodeEnum.TOKEN_EXPIRED,
          this.globalService.serverLang('Token过期', 'user.tokenExpired'),
        );
      }
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.serverLang('无效的Token', 'user.tokenInvalid'),
      );
    }
  }
}
