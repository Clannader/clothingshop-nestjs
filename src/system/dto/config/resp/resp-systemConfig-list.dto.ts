/**
 * Create by oliver.wu 2024/11/27
 */
import { CommonResult } from '@/common';
import { ListSystemConfigDto } from '../list-systemConfig.dto';

export class RespSystemConfigListDto extends CommonResult {
  /**
   * 配置列表
   */
  configList: ListSystemConfigDto[];

  /**
   * 总数
   */
  total: number;
}
