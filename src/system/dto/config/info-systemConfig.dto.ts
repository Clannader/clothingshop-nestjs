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
}
