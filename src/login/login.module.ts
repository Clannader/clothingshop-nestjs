import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { UserModule } from '@/user';
import { MemoryCacheModule } from '@/cache/modules';
import { SecuritySessionModule } from '@/security';

@Module({
  imports: [UserModule, MemoryCacheModule, SecuritySessionModule],
  controllers: [LoginController],
})
export class LoginModule {}
