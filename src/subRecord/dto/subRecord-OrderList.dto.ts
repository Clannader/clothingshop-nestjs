/**
 * Create by oliver.wu 2026/7/3
 */
import { Expose } from 'class-transformer';
import { SubRecordOrderDto } from './subRecord-order.dto';

export class SubRecordOrderListDto extends SubRecordOrderDto {
  /**
   *  数据的ID
   */
  @Expose()
  id: string;
}
