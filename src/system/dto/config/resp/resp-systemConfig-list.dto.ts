/**
 * Create by oliver.wu 2024/11/27
 */
import { CommonResult } from '@/common';

export class RespSystemConfigListDto extends CommonResult {
  /**
   * 配置列表
   */
  configList: string[];

  /**
   * 总数
   */
  total: number;
}
