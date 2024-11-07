/**
 * Create by oliver.wu 2024/11/6
 */
import { Module } from '@nestjs/common';

import { SyncUpdateCacheModule } from '@/cache/modules';
import { ApplicationHookService } from '../services';

@Module({
  imports: [SyncUpdateCacheModule],
  providers: [ApplicationHookService],
})
export class ApplicationHookModule {}
