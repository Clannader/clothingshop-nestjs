/**
 * Create by oliver.wu 2024/11/8
 */
import { CommonResult } from './common.dto';

export class RespSecuritySessionDto extends CommonResult {
  /**
   * 会话ID
   */
  sessionId: string;

  /**
   * 会话值
   */
  accessKey: string;

  /**
   * 偏移值
   */
  vectorValue: string;
}
