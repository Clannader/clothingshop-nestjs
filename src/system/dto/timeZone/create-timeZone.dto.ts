/**
 * Create by oliver.wu 2024/10/15
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsOptional, Matches } from 'class-validator';
import { shopIdExp } from '@/common';

export class CreateTimeZoneDto {
  /**
   * 店铺ID
   */
  @IsOptional()
  @IsString()
  @Matches(shopIdExp, {
    message: 'The shopId format ($value) is invalid',
  })
  @Expose()
  shopId?: string;

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

  /**
   * 描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}
