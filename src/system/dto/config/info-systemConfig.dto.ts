/**
 * Create by oliver.wu 2025/8/6
 */
import { ModifyChildrenConfigDto } from './modify-childrenConfig.dto';
import { OmitType } from '@nestjs/swagger';

export class InfoSystemConfigDto extends OmitType(ModifyChildrenConfigDto, [
  'groupName',
] as const) {
  /**
   * 父级的组名
   */
  groupName?: string;

  /**
   * 创建人
   */
  createUser?: string;

  /**
   * 创建时间
   */
  createDate?: Date;

  /**
   * 更新者
   */
  updateUser?: string;

  /**
   * 更新时间
   */
  updateDate?: Date;
}
