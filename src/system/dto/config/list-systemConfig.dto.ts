/**
 * Create by oliver.wu 2025/3/27
 */
import { ModifyParentConfigDto } from './modify-parentConfig.dto';
import { ModifyChildrenConfigDto } from './modify-childrenConfig.dto';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ListSystemConfigDto extends ModifyParentConfigDto {
  /**
   * 二级配置
   */
  @Expose()
  @IsOptional()
  childrenConfig?: ModifyChildrenConfigDto[];
}
