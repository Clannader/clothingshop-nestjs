/**
 * Create by oliver.wu 2024/10/16
 */
import { CreateTimeZoneDto } from '../timeZone';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class ReqTimeZoneModifyDto extends PartialType(CreateTimeZoneDto) {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @Expose()
  id: string;
}
