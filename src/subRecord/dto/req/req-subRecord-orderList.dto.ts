/**
 * Create by oliver.wu 2026/7/3
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ReqBasePageDto } from '@/common';

export class ReqSubRecordOrderListDto extends ReqBasePageDto {
  /**
   * 商品名
   */
  @Expose()
  @IsString()
  @IsOptional()
  productName?: string;
}
