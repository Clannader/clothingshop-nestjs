/**
 * Create by oliver.wu 2025/12/4
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsOptional } from 'class-validator';

export class ModifyRightsCodesDto {
  /**
   * 编辑的ID值
   */
  @IsDefined()
  @IsString()
  @Expose()
  id: string;

  /**
   * 中文描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  cnLabel: string;

  /**
   * 英文描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  enLabel: string;

  /**
   * 描述
   */
  @IsOptional()
  @IsString()
  @Expose()
  description?: string;
}
