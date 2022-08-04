/**
 * Create by CC on 2022/8/4
 */
import { Expose } from 'class-transformer';
export class ReqFileUploadMergeDto {
  /**
   * 文件名HASH值
   */
  @Expose()
  fileHash: string;

  /**
   * 文件的分片总数
   */
  @Expose()
  fileChunk: number;

  /**
   * 文件名
   */
  @Expose()
  fileName: string;
}
