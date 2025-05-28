/**
 * Create by oliver.wu 2025/5/21
 */
import { ModifyChildrenConfigDto } from '../modify-childrenConfig.dto';
import { PartialType } from '@nestjs/swagger';

export class ReqChildrenConfigCheckInfoDto extends PartialType(
  ModifyChildrenConfigDto,
) {}
