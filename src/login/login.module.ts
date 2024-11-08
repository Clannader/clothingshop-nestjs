import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { UserModule } from '@/user';
import { MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [UserModule, MemoryCacheModule],
  controllers: [LoginController],
})
export class LoginModule {}
