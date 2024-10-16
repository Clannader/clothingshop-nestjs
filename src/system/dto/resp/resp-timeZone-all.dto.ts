/**
 * Create by oliver.wu 2024/10/16
 */
import { CreateTimeZoneDto } from '../timeZone';
import { CommonResult } from '@/common';

export class RespTimeZoneAllDto extends CommonResult {
  /**
   * 时区列表
   */
  timeZones: CreateTimeZoneDto[];
}
