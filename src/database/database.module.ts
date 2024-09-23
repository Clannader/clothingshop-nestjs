/**
 * Create by oliver.wu 2024/9/20
 */
import { Module } from '@nestjs/common';

import { DatabaseController } from './controllers';
import { DatabaseService } from './services';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
