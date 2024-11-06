/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';

import { TestTasksService } from '../services';
import {
  SequenceSchemaModule,
  AdminLogSchemaModule,
  RightCodeGroupSchemaModule,
} from '@/entities/modules';
import { TokenCacheModule } from '@/cache/modules';

@Module({
  imports: [
    SequenceSchemaModule,
    AdminLogSchemaModule,
    TokenCacheModule,
    RightCodeGroupSchemaModule,
  ],
  providers: [TestTasksService],
  exports: [TestTasksService],
})
export class TestTasksModule {}
