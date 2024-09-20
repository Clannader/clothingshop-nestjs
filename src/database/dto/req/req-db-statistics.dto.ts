/**
 * Create by oliver.wu 2024/9/20
 */
import { IsArray, IsDefined } from 'class-validator';
import { Expose } from 'class-transformer';

export class ReqDbStatisticsDto {
  /**
   * 数据库别名列表
   */
  @IsDefined() // 必填
  @IsArray() // 必须是数组
  @Expose()
  aliasNames: string[];
}