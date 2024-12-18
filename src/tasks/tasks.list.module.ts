/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { TestTasksModule, SyncAllTasksModule } from './modules';

@Module({
  imports: [
    ScheduleModule.forRoot({
      intervals: false,
    }),
    TestTasksModule,
    SyncAllTasksModule,
  ],
})
export class TasksListModule {}
