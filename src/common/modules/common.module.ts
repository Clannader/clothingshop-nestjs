import { Module, Global } from '@nestjs/common';
import { GlobalService } from '../utils';
import { UserSessionService } from '@/user/user.session.service';

@Global()
@Module({
  providers: [GlobalService, UserSessionService],
  exports: [GlobalService, UserSessionService],
})
export class CommonModule {}
