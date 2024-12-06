/**
 * Create by oliver.wu 2024/11/6
 */
import { Module } from '@nestjs/common';

import { ApplicationHookService } from '../services';

@Module({
  providers: [ApplicationHookService],
})
export class ApplicationHookModule {}
