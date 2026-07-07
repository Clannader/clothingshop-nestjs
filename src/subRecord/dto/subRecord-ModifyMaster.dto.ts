/**
 * Create by oliver.wu 2026/7/7
 */
import { PartialType } from '@nestjs/swagger';
import { SubRecordCreateMasterDto } from './subRecord-CreateMaster.dto';
import { Expose } from 'class-transformer';
import { IsDefined, IsMongoId } from 'class-validator';

export class SubRecordModifyMasterDto extends PartialType(
  SubRecordCreateMasterDto,
) {
  /**
   *  数据的ID
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  id: string;
}
