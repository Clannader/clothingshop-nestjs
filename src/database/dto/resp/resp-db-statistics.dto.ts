/**
 * Create by oliver.wu 2024/9/20
 */
import { CommonResult } from '@/common';
import { DbStatisticsDto } from '../db-statistics.dto';

export class RespDbStatisticsDto extends CommonResult {
  /**
   * 每个表的统计集合
   */
  collectionStatistics: DbStatisticsDto[];
}
