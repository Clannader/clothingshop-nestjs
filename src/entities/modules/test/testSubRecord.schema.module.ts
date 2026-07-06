/**
 * Create by oliver.wu 2026/7/3
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestSubRecord, TestSubRecordSchema } from '../../schema';
import { TestSubRecordSchemaService } from '../../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestSubRecord.name, schema: TestSubRecordSchema },
    ]),
  ],
  providers: [TestSubRecordSchemaService],
  exports: [TestSubRecordSchemaService],
})
export class TestSubRecordSchemaModule {}
