/**
 * Create by oliver.wu 2024/10/15
 */
import { ListTimeZoneDto } from '../timeZone';
import { CommonResult } from '@/common';

export class RespTimeZoneListDto extends CommonResult {
  /**
   * 时区列表
   */
  timeZones: ListTimeZoneDto;
}
