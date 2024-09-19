/**
 * Create by CC on 2022/6/2
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccess, AdminAccessSchema } from '../schema';
import { AdminAccessService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAccess.name, schema: AdminAccessSchema },
    ]),
  ],
  providers: [AdminAccessService],
  exports: [AdminAccessService],
})
export class AdminAccessModule {}
