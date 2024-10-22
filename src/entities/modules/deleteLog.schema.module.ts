/**
 * Create by oliver.wu 2024/10/22
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeleteLog, DeleteLogSchema } from '../schema';
import { DeleteLogSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeleteLog.name, schema: DeleteLogSchema },
    ]),
  ],
  providers: [DeleteLogSchemaService],
  exports: [DeleteLogSchemaService],
})
export class DeleteLogSchemaModule {}
