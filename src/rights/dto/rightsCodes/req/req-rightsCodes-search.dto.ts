/**
 * Create by oliver.wu 2025/12/4
 */
import { Expose } from 'class-transformer';

export class ReqRightsCodesSearchDto {
  /**
   * 搜索权限代码
   */
  @Expose()
  codeNumber?: string;

  /**
   * 搜索权限名,支持中英文
   */
  @Expose()
  codeLabel?: string;

  /**
   * 搜索权限描述
   */
  @Expose()
  description?: string;
}
