/**
 * Create by CC on 2022/7/19
 */
import { Injectable } from '@nestjs/common';
import { RequestSession } from '@/common';

@Injectable()
export class UserSessionService {
  deleteSession(req: RequestSession): Promise<void> {
    delete req.session;
    return new Promise((resolve) => {
      req.sessionStore.destroy(req.sessionID, () => {
        resolve();
      });
    });
  }
}
