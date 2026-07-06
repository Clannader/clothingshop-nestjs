/**
 * Create by oliver.wu 2026/7/6
 */
import { SubRecordInfoMasterDto } from '../subRecord-InfoMaster.dto';
import { CommonResult } from '@/common';

export class RespSubRecordQueryMasterDto extends CommonResult {
  /**
   * 订单列表
   */
  items: SubRecordInfoMasterDto[];
}
