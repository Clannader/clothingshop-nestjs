/**
 * Create by CC on 2022/6/9
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../schema';
import { AdminSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  providers: [AdminSchemaService],
  exports: [AdminSchemaService],
})
export class AdminSchemaModule {}
