/**
 * Create by oliver.wu 2024/9/20
 */
import { Module } from '@nestjs/common';
import { MongooseConfigService } from './mongoose.config.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
  ],
})
export class MongooseConfigModule {}
