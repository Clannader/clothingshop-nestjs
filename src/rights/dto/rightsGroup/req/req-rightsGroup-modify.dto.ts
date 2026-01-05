/**
 * Create by oliver.wu 2025/12/26
 */
import { CreateRightsGroupDto } from '../create-rightsGroup.dto';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsMongoId } from 'class-validator';

export class ReqRightsGroupModifyDto extends PartialType(CreateRightsGroupDto) {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @IsMongoId()
  @Expose()
  id: string;
}
