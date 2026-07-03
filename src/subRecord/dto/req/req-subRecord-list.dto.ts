/**
 * Create by oliver.wu 2026/7/3
 */
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ReqSubRecordListDto {
  /**
   * 子文档名称
   */
  @Expose()
  @IsString()
  subName: string;
}
