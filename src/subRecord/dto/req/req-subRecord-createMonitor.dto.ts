/**
 * Create by oliver.wu 2026/7/14
 */
import { SubRecordMonitorDto } from '../subRecord-monitor.dto';
import { Expose } from 'class-transformer';
import { IsDefined, IsMongoId } from 'class-validator';

export class ReqSubRecordCreateMonitorDto extends SubRecordMonitorDto {
  /**
   *  主文档的ID
   */
  @Expose()
  @IsDefined()
  @IsMongoId()
  id: string;
}
