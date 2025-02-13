/**
 * Create by oliver.wu 2024/11/27
 */
import { Expose } from 'class-transformer';
import { SystemConfigTypeEnum } from '@/common/enum';
import { IsEnum, IsOptional } from 'class-validator';

export class ReqSystemConfigListDto {
  /**
   * 是否包含子级返回,默认只返回父级数据
   */
  @Expose()
  @IsOptional()
  // @IsEnum(SystemConfigTypeEnum)
  includeChildren?: boolean;

  /**
   * 父级的组名
   */
  @Expose()
  @IsOptional()
  groupName?: string;

  /**
   * 配置的KEY
   */
  @Expose()
  @IsOptional()
  configKey?: string;
}
