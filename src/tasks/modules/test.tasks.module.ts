/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';

import { TestTasksService } from '../services';
import { SystemConfigSchemaModule } from '@/entities/modules';

@Module({
  imports: [SystemConfigSchemaModule],
  providers: [TestTasksService],
})
export class TestTasksModule {}
