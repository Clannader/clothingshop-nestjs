/**
 * Create by oliver.wu 2026/7/6
 */
import { Expose } from 'class-transformer';
import { SubRecordCreateMasterDto } from './subRecord-CreateMaster.dto';
import { SubRecordListDto } from './subRecord-list.dto';

import { IsDefined, IsArray } from 'class-validator';

export class SubRecordInfoMasterDto extends SubRecordCreateMasterDto {
  /**
   * 商品名
   */
  @Expose()
  @IsArray()
  @IsDefined()
  orders: SubRecordListDto[];
}
