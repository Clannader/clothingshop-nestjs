/**
 * Create by CC on 2022/8/4
 */
import { Expose } from 'class-transformer';
export class ReqFileUploadAlreadyDto {
  /**
   * 文件名HASH值
   */
  @Expose()
  fileHash: string;
}
