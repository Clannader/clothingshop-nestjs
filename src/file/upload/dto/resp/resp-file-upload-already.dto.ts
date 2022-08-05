/**
 * Create by CC on 2022/8/4
 */
import { CommonResult } from '@/common';

export class RespFileUploadAlreadyDto extends CommonResult {
  /**
   * 文件分片下拉列表
   */
  fileChunk: number[];
}
