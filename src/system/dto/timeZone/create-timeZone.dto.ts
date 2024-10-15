/**
 * Create by oliver.wu 2024/10/15
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class CreateTimeZoneDto {
  /**
   * 时区名称
   */
  @IsDefined()
  @IsString()
  @Expose()
  timeZoneName: string;

  /**
   * 夏令时
   */
  @IsDefined()
  @IsString()
  @Expose()
  summerTime: string;

  /**
   * 冬令时
   */
  @IsDefined()
  @IsString()
  @Expose()
  winterTime: string;
}
