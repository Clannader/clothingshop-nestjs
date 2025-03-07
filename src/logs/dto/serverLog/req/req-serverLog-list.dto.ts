/**
 * Create by oliver.wu 2025/3/7
 */
import { Expose } from 'class-transformer';

export class ReqServerLogListDto {
  /**
   * 查询大于等于某天的所有日志,格式YYYY-MM-DD
   */
  @Expose()
  date?: string;
}
