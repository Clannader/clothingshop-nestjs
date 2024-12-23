/**
 * Create by oliver.wu 2024/11/5
 */
import { Module } from '@nestjs/common';

import { IntervalsTaskNameModule } from '@/lib/intervals-task-name'
import { SyncAllTasksService } from '../services';

@Module({
  imports: [IntervalsTaskNameModule],
  providers: [SyncAllTasksService],
})
export class SyncAllTasksModule {}
