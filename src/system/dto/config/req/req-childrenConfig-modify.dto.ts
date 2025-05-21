/**
 * Create by oliver.wu 2025/5/21
 */
import { CreateChildrenConfigDto } from '../create-childrenConfig.dto';
import { PartialType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class ReqChildrenConfigModifyDto extends PartialType(
  CreateChildrenConfigDto,
) {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @Expose()
  id: string;
}
