/**
 * Create by oliver.wu 2026/7/15
 */
import { CommonResult } from './common.dto';

export class RespBasePageDto extends CommonResult{
  /**
   * 总数
   */
  total: number;
}