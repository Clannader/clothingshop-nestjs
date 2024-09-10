import { Module, Global } from '@nestjs/common';
import { GlobalService } from '../utils';
import { UserSessionService } from '@/user/user.session.service';
import { SecretConfigModule } from './secret.config.module';

@Global()
@Module({
  imports: [SecretConfigModule.register()],
  providers: [GlobalService, UserSessionService],
  exports: [GlobalService, UserSessionService],
})
export class CommonModule {}
