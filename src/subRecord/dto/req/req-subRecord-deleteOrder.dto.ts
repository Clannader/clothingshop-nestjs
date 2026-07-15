/**
 * Create by oliver.wu 2026/7/15
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsMongoId } from 'class-validator';

export class ReqSubRecordDeleteOrderDto {
  /**
   *  主文档的ID
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  id: string;

  /**
   *  订单ID号
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  subId: string;
}
