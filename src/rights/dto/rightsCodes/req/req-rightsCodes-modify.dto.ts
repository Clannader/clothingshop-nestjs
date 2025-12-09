/**
 * Create by oliver.wu 2025/12/8
 */
import { ModifyRightsCodesDto } from '../modify-rightsCodes.dto';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class ReqRightsCodesModifyDto extends PartialType(ModifyRightsCodesDto) {
  /**
   * 编辑的ID值
   */
  @Expose()
  @IsDefined()
  @IsString()
  id: string;
}
