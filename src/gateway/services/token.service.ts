/**
 * Create by CC on 2022/8/9
 */
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CmsSession, languageType } from '@/common';
import { CodeEnum } from '@/common/enum';
import { CodeException } from '@/common/exceptions';
import { GlobalService } from '@/common/utils';

@Injectable()
export class TokenService {
  @Inject()
  private readonly jwtService: JwtService;

  @Inject()
  private readonly globalService: GlobalService;

  /**
   * 生成token
   * @param session
   * @param expired
   */
  generateToken(session: CmsSession, expired: string | number) {
    return this.jwtService.sign(session, { expiresIn: expired });
  }

  /**
   * 校验token
   * @param language
   * @param token
   */
  verifyToken(language: languageType, token: string) {
    try {
      return this.jwtService.verify(token);
    } catch ({ name, message }) {
      if (name === 'TokenExpiredError') {
        throw new CodeException(
          CodeEnum.TOKEN_EXPIRED,
          this.globalService.lang(language, 'Token过期', 'user.tokenExpired'),
        );
      }
      throw new CodeException(
        CodeEnum.INVALID_TOKEN,
        this.globalService.lang(language, '无效的Token', 'user.tokenInvalid'),
      );
    }
  }
}
