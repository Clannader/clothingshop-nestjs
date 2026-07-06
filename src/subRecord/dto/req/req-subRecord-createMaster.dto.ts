/**
 * Create by oliver.wu 2026/7/6
 */
import { SubRecordCreateMasterDto } from '../subRecord-CreateMaster.dto';
import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ReqSubRecordCreateMasterDto extends OmitType(
  SubRecordCreateMasterDto,
  ['phone'] as const,
) {
  /**
   * 主文档电话
   */
  @Expose()
  @IsString()
  @IsOptional()
  phone?: string;
}
