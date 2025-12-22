/**
 * Create by oliver.wu 2025/12/19
 */
import { Module } from '@nestjs/common';
import { StatisticsUrlCountService } from '../services';
import { StatisticsUrlSchemaModule } from '@/entities/modules';

@Module({
  imports: [StatisticsUrlSchemaModule],
  providers: [StatisticsUrlCountService],
  exports: [StatisticsUrlCountService],
})
export class StatisticsUrlCountModule {}
