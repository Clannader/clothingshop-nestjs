/**
 * Create by oliver.wu 2026/7/7
 */
import { SubRecordCreateMasterDto } from './subRecord-CreateMaster.dto';
import { Expose } from 'class-transformer';

export class SubRecordModifyMasterDto extends SubRecordCreateMasterDto {
  /**
   *  数据的ID
   */
  @Expose()
  id: string;
}
