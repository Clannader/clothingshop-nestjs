/**
 * Create by oliver.wu 2025/8/6
 */
import { CommonResult } from '@/common';
import { ModifyChildrenConfigDto } from '../modify-childrenConfig.dto';

export class RespSystemConfigSingleDto extends CommonResult {
  /**
   * 配置详细信息
   */
  configInfo: ModifyChildrenConfigDto;
}
