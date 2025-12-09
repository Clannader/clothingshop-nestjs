/**
 * Create by oliver.wu 2025/12/4
 */
import { Expose } from 'class-transformer';
import { ModifyRightsCodesDto } from './modify-rightsCodes.dto';

export class SearchRightsCodesDto extends ModifyRightsCodesDto {
  /**
   * 编辑的ID值
   */
  @Expose()
  id: string;

  /**
   * 权限代码
   */
  @Expose()
  codeNumber: string;

  /**
   * 权限Key
   */
  @Expose()
  codeKey: string;

  /**
   * 权限分类
   */
  @Expose()
  codeCategory: string;
}
