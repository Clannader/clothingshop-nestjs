/**
 * Create by CC on 2022/7/19
 */
import { Inject, Injectable } from '@nestjs/common';
import {
  RequestSession,
} from '@/common';
import {
  CodeEnum,
} from '@/common/enum';
import {
  CodeException,
} from '@/common/exceptions';
import {
  GlobalService,
} from '@/common/utils';
import {
  CONFIG_SECRET,
} from '@/common/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserSessionService {
  @Inject()
  private globalService: GlobalService;

  @Inject(CONFIG_SECRET)
  private secretConfig: Record<string, any>;

  deleteSession(req: RequestSession): Promise<void> {
    delete req.session;
    return new Promise((resolve) => {
      req.sessionStore.destroy(req.sessionID, () => {
        resolve();
      });
    });
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.secretConfig['tripleKey']) as any;
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
