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
   * 文件buffer类型的base64字符串
   */
  @Expose()
  fileContent: string;
}
