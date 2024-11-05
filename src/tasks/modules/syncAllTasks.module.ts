/**
 * Create by oliver.wu 2024/11/5
 */
import { Module } from '@nestjs/common';

import { SyncAllTasksService } from '../services';

@Module({
  providers: [SyncAllTasksService],
})
export class SyncAllTasksModule {}