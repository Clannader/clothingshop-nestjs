import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { UserModule } from '@/user';

@Module({
  imports: [UserModule],
  controllers: [LoginController],
})
export class LoginModule {}
