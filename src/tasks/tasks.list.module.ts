/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@andybeat/schedule';

import { TestTasksModule, SyncAllTasksModule } from './modules';

@Module({
  imports: [
    ScheduleModule.forRoot({
      intervals: true,
    }),
    TestTasksModule,
    SyncAllTasksModule,
  ],
})
export class TasksListModule {}
