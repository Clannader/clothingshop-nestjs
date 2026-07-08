/**
 * Create by oliver.wu 2026/7/3
 */
import { Module } from '@nestjs/common';
import { SubRecordService } from '../services';
import { SubRecordController } from '../controllers';
import { TestSubRecordSchemaModule } from '@/entities/modules';

@Module({
  imports: [TestSubRecordSchemaModule],
  controllers: [SubRecordController],
  providers: [SubRecordService],
})
export class SubRecordModule {}
