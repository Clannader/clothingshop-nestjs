/**
 * Create by oliver.wu 2024/10/11
 */
import { Module } from '@nestjs/common';

import { TestTasksService } from '../services';
import { SequenceSchemaModule, AdminLogSchemaModule } from '@/entities/modules';
import { TokenCacheModule } from '@/cache/modules';

@Module({
  imports: [SequenceSchemaModule, AdminLogSchemaModule, TokenCacheModule],
  providers: [TestTasksService],
})
export class TestTasksModule {}
