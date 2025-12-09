/**
 * Create by oliver.wu 2025/12/4
 */
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ReqRightsCodesSearchDto {
  /**
   * 搜索权限代码
   */
  @IsOptional()
  @Expose()
  codeNumber?: string;

  /**
   * 搜索权限名,支持中英文
   */
  @IsOptional()
  @Expose()
  codeLabel?: string;

  /**
   * 搜索权限描述
   */
  @IsOptional()
  @Expose()
  description?: string;
}
