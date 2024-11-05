/**
 * Create by oliver.wu 2024/11/5
 */
import { Module } from '@nestjs/common';

import { TestTasksModule } from './test.tasks.module';
import { SyncAllTasksService } from '../services';

@Module({
  imports: [TestTasksModule],
  providers: [SyncAllTasksService],
})
export class SyncAllTasksModule {}
