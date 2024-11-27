/**
 * Create by oliver.wu 2024/11/27
 */
import { Expose } from 'class-transformer';
import { SystemConfigTypeEnum } from '@/common/enum';
import { IsEnum } from 'class-validator';

export class ReqSystemConfigListDto {
  /**
   * 仅包含一级或者二级返回
   */
  @Expose()
  @IsEnum(SystemConfigTypeEnum)
  onlyInclude?: SystemConfigTypeEnum;
}
