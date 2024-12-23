/**
 * Create by oliver.wu 2024/12/20
 */
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { IntervalsTaskNameAccessor } from './intervals-task-name.accessor';
import { IntervalsTaskNameRegistry } from './intervals-task-name.registry';

@Module({
  imports: [DiscoveryModule],
  providers: [IntervalsTaskNameAccessor, IntervalsTaskNameRegistry],
  exports: [IntervalsTaskNameRegistry]
})
export class IntervalsTaskNameModule {}
