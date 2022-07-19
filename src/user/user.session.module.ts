/**
 * Create by CC on 2022/7/19
 */
import { Module, Global } from '@nestjs/common';
import { UserSessionService } from './user.session.service';

@Global()
@Module({
  providers: [UserSessionService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
