/**
 * Create by oliver.wu 2026/7/3
 */
import { Expose } from 'class-transformer';
import { SubRecordSubCreateDto } from './subRecord-subCreate.dto';

export class SubRecordListDto extends SubRecordSubCreateDto {
  /**
   *  数据的ID
   */
  @Expose()
  id: string;
}
