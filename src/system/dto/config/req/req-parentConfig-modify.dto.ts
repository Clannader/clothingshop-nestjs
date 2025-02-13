/**
 * Create by oliver.wu 2025/2/13
 */
import { CreateParentConfigDto } from '../create-parentConfig.dto';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class ReqParentConfigModifyDto extends PartialType(
  CreateParentConfigDto,
) {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @Expose()
  id: string;
}
