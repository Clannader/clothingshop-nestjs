/**
 * Create by oliver.wu 2025/12/18
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsUrl, StatisticsUrlSchema } from '../schema';
import { StatisticsUrlSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StatisticsUrl.name, schema: StatisticsUrlSchema },
    ]),
  ],
  providers: [StatisticsUrlSchemaService],
  exports: [StatisticsUrlSchemaService],
})
export class StatisticsUrlSchemaModule {}
