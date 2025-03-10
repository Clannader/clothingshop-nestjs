/**
 * Create by oliver.wu 2025/3/7
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ReqServerLogListDto {
  /**
   * 查询大于等于某天的所有日志,格式YYYY-MM-DD
   */
  @IsOptional()
  @IsString()
  @Expose()
  // TODO 新增日期格式校验
  date?: string;
}
