/**
 * Create by oliver.wu 2025/12/4
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class ModifyRightsCodesDto {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @Expose()
  id: string;

  /**
   * 中文显示
   */
  @IsDefined()
  @IsString()
  @Expose()
  cnLabel: string;

  /**
   * 英文显示
   */
  @IsDefined()
  @IsString()
  @Expose()
  enLabel: string;

  /**
   * 权限代码描述
   */
  @IsDefined()
  @IsString()
  @Expose()
  description: string;
}
