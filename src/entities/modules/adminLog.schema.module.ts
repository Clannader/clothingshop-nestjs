/**
 * Create by oliver.wu 2024/10/10
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminLog, AdminLogSchema } from '../schema';
import { AdminLogSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminLog.name, schema: AdminLogSchema },
    ]),
  ],
  providers: [AdminLogSchemaService],
  exports: [AdminLogSchemaService],
})
export class AdminLogSchemaModule {}
