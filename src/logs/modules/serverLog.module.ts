/**
 * Create by oliver.wu 2025/3/7
 */
import { Module } from '@nestjs/common';
import { ServerLogService } from '../services';
import { ServerLogController } from '../controllers';

@Module({
  controllers: [ServerLogController],
  providers: [ServerLogService],
})
export class ServerLogModule {}
