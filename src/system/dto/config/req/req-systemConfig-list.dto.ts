/**
 * Create by oliver.wu 2024/11/27
 */
import { Expose } from 'class-transformer';
import { SystemConfigTypeEnum } from '@/common/enum';
import { IsEnum, IsOptional } from 'class-validator';

export class ReqSystemConfigListDto {
  /**
   * 仅包含父级或者子级返回
   */
  @Expose()
  @IsOptional()
  @IsEnum(SystemConfigTypeEnum)
  onlyInclude?: SystemConfigTypeEnum;
}
