/**
 * Create by oliver.wu 2024/9/20
 */
import { CommonResult } from '@/common';

export class RespCollectionsNameDto extends CommonResult {
  /**
   * 数据库别名列表
   */
  aliasNames: string[];
}
