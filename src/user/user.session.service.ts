/**
 * Create by CC on 2022/7/19
 */
import { Inject, Injectable } from '@nestjs/common';
import { RequestSession } from '@/common';
import { CodeEnum } from '@/common/enum';
import { CodeException } from '@/common/exceptions';
import { GlobalService } from '@/common/utils';
import { CONFIG_SECRET } from '@/common/config';
import * as jwt from 'jsonwebtoken';

import type { LanguageType } from '@/common';

@Injectable()
export class UserSessionService {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject(CONFIG_SECRET)
  private readonly secretConfig: Record<string, any>;

  deleteSession(req: RequestSession): Promise<void> {
    delete req.session;
    return new Promise((resolve) => {
      req.sessionStore.destroy(req.sessionID, () => {
        resolve();
      });
    });
  }

  verifyToken(language: LanguageType, token: string) {
    try {
      return jwt.verify(token, this.secretConfig['jwtSecret']) as any;
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
