/**
 * Create by oliver.wu 2024/10/15
 */
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ReqTimeZoneListDto {
  /**
   * 搜索的时区名
   */
  @IsOptional()
  @Expose()
  timeZone?: string;
}
