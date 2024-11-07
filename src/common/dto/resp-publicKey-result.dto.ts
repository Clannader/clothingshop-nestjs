/**
 * Create by oliver.wu 2024/11/7
 */
import { CommonResult } from './common.dto';

export class RespPublicKeyResultDto extends CommonResult {
  /**
   * 公共密钥(Base64)
   */
  publicKey: string;
}
