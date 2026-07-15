/**
 * Create by oliver.wu 2026/7/3
 */
import { SubRecordOrderListDto } from '../subRecord-OrderList.dto';
import { CommonResult } from '@/common';

export class RespSubRecordListDto extends CommonResult {
  /**
   * 订单列表
   */
  orders: SubRecordOrderListDto[];
}
