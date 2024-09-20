/**
 * Create by oliver.wu 2024/9/20
 */
import { Module } from '@nestjs/common';

import { MongooseConfigModule } from '@/dao';
import { DatabaseController } from './controller';
import { DatabaseService } from './services';

@Module({
  imports: [MongooseConfigModule],
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
