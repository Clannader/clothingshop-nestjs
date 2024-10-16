/**
 * Create by oliver.wu 2024/10/15
 */
import { Expose } from 'class-transformer';

export class ReqTimeZoneListDto {
  /**
   * 搜索的时区名
   */
  @Expose()
  timeZone?: string;
}
