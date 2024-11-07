/**
 * Create by oliver.wu 2024/10/16
 * 删除操作时返回的错误结果集
 */
import { CommonResult } from './common.dto';

export class RespErrorResult extends CommonResult {
  /**
   * 错误的结果集
   */
  errResult: string[];
}
