/**
 * Create by CC on 2022/8/1
 */
import { Expose } from 'class-transformer';
export class ReqFileUploadTestDto {
  /**
   * 文件名
   */
  @Expose()
  fileName: string;

  /**
   * 文件buffer的内容
   */
  @Expose()
  fileContent: Buffer;
}
