/**
 * Create by oliver.wu 2024/10/16
 */
import { CreateTimeZoneDto } from '../timeZone';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsMongoId } from 'class-validator';

export class ReqTimeZoneModifyDto extends PartialType(CreateTimeZoneDto) {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @IsMongoId()
  @Expose()
  id: string;
}
