/**
 * Create by oliver.wu 2026/7/3
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsMongoId, IsDefined } from 'class-validator';
import { ReqBasePageDto } from '@/common';

export class ReqSubRecordOrderListDto extends ReqBasePageDto {
  /**
   *  主文档的ID
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  id: string;

  /**
   * 商品名
   */
  @Expose()
  @IsString()
  @IsOptional()
  productName?: string;
}
