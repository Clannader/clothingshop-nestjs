import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminSchemaModule } from '@/entities/modules';
import { MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [AdminSchemaModule, MemoryCacheModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
