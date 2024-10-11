/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';
import { TestTasksService } from '../services';

@Module({
  providers: [TestTasksService],
})
export class TestTasksModule {}
