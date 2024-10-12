/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';

import { TestTasksService } from '../services';
import { SequenceSchemaModule } from '@/entities/modules';

@Module({
  imports: [SequenceSchemaModule],
  providers: [TestTasksService],
})
export class TestTasksModule {}
