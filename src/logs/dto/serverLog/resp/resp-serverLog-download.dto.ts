/**
 * Create by oliver.wu 2025/3/12
 */
import { CommonResult } from '@/common';

export class RespServerLogDownloadDto extends CommonResult {
  /**
   * 文件内容,base64格式
   */
  logContent: string;
}
