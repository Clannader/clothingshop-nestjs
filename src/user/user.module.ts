import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [SystemModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
