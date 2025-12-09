/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';

import { TestTasksService } from '../services';
import {
  SequenceSchemaModule,
  AdminLogSchemaModule,
  RightsCodesGroupSchemaModule,
} from '@/entities/modules';
import { TokenCacheModule, MemoryCacheModule } from '@/cache/modules';

@Module({
  imports: [
    SequenceSchemaModule,
    AdminLogSchemaModule,
    TokenCacheModule,
    RightsCodesGroupSchemaModule,
    MemoryCacheModule,
  ],
  providers: [TestTasksService],
  exports: [TestTasksService],
})
export class TestTasksModule {}
