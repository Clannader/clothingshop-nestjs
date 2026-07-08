/**
 * Create by oliver.wu 2026/7/7
 */
import { PartialType, OmitType } from '@nestjs/swagger';
import { SubRecordModifyMasterDto } from '../subRecord-ModifyMaster.dto';
import { Expose } from 'class-transformer';
import { IsDefined, IsMongoId } from 'class-validator';

export class ReqSubRecordModifyMasterDto extends OmitType(
  PartialType(SubRecordModifyMasterDto),
  ['id'] as const,
) {
  /**
   *  编辑的数据ID
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  id: string;
}
