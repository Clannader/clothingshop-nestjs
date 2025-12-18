/**
 * Create by oliver.wu 2025/12/18
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { StatisticsUrlModel, StatisticsUrl } from '../../schema';

@Injectable()
export class StatisticsUrlSchemaService {
  @InjectModel(StatisticsUrl.name)
  private readonly statisticsUrlModel: StatisticsUrlModel;

  getStatisticsUrlModel() {
    return this.statisticsUrlModel;
  }
}
