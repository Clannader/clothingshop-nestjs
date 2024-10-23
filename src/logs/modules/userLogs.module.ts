/**
 * Create by oliver.wu 2024/10/15
 */
import { Module } from '@nestjs/common';

import { AdminLogSchemaModule } from '@/entities/modules';
import { UserLogsService } from '../services';
import { TraceIdCacheModule } from '@/cache/modules';

@Module({
  imports: [AdminLogSchemaModule, TraceIdCacheModule],
  providers: [UserLogsService],
  exports: [UserLogsService],
})
export class UserLogsModule {}
