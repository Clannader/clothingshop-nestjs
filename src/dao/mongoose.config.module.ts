/**
 * Create by oliver.wu 2024/9/20
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongooseConfigService } from './mongoose.config.service';
import { ConfigService } from '@/common/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
      inject: [ConfigService]
    }),
  ],
  // exports: [MongooseConfigService]
})
export class MongooseConfigModule {}
