/**
 * Create by oliver.wu 2026/7/6
 */
import { PartialType } from '@nestjs/swagger';
import { SubRecordCreateMasterDto } from '../subRecord-CreateMaster.dto';

export class ReqSubRecordQueryMasterDto extends PartialType(
  SubRecordCreateMasterDto,
) {}
