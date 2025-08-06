/**
 * Create by oliver.wu 2025/8/6
 */
import { CommonResult } from '@/common';
import { InfoSystemConfigDto } from '../info-systemConfig.dto';

export class RespSystemConfigSingleDto extends CommonResult {
  /**
   * 配置详细信息
   */
  configInfo: InfoSystemConfigDto;
}
