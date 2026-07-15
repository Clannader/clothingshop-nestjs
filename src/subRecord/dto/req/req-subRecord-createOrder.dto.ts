/**
 * Create by oliver.wu 2026/7/15
 */
import { SubRecordOrderDto } from '../subRecord-order.dto';
import { Expose } from 'class-transformer';
import { IsDefined, IsMongoId } from 'class-validator';

export class ReqSubRecordCreateOrderDto extends SubRecordOrderDto {
  /**
   *  主文档的ID
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  id: string;
}
