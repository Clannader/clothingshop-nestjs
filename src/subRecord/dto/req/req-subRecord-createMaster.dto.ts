/**
 * Create by oliver.wu 2026/7/6
 */
import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsDefined } from 'class-validator';

export class ReqSubRecordCreateMasterDto {
  /**
   * 主文档名称
   */
  @Expose()
  @IsString()
  @IsDefined()
  name: string;

  /**
   * 主文档电话
   */
  @Expose()
  @IsString()
  @IsOptional()
  phone?: string;
}
