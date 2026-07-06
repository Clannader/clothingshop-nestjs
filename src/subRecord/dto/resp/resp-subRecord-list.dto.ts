/**
 * Create by oliver.wu 2026/7/3
 */
import { SubRecordListDto } from '../subRecord-list.dto';
import { CommonResult } from '@/common';

export class RespSubRecordListDto extends CommonResult {
  /**
   * 订单列表
   */
  orders: SubRecordListDto[];
}
