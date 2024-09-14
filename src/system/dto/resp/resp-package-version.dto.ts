import { CommonResult } from '@/common';

export class RespPackageVersionDto extends CommonResult {
  /**
   * 依赖包版本列表
   */
  version: Record<string, string>
}