/**
 * Create by oliver.wu 2026/7/3
 */
import { SubRecordOrderListDto } from '../subRecord-OrderList.dto';
import { RespBasePageDto } from '@/common';

export class RespSubRecordOrderListDto extends RespBasePageDto {
  /**
   * 订单列表
   */
  orders: SubRecordOrderListDto[];
}
