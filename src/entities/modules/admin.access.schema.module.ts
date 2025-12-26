/**
 * Create by CC on 2022/6/2
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAccess, AdminAccessSchema } from '../schema';
import { AdminAccessSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAccess.name, schema: AdminAccessSchema },
    ]),
  ],
  providers: [AdminAccessSchemaService],
  exports: [AdminAccessSchemaService],
})
export class AdminAccessSchemaModule {}
