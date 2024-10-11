/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { TestTasksModule } from './modules';

@Module({
  imports: [ScheduleModule.forRoot(), TestTasksModule],
})
export class TasksModule {}
