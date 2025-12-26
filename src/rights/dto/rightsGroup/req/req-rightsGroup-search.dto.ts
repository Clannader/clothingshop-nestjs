/**
 * Create by oliver.wu 2025/12/26
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class ReqRightsGroupSearchDto {
  /**
   * 搜索权限组名
   */
  @IsOptional()
  @IsString()
  @Expose()
  groupCode?: string;

  /**
   * 搜索权限组描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  groupName?: string;

  /**
   * 搜索权限代码
   */
  @IsOptional()
  @IsArray()
  @Expose()
  rightCodes?: string[];
}
