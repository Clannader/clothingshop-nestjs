/**
 * Create by oliver.wu 2024/10/16
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';

export class DeleteResultDto {
  /**
   * ID号列表
   */
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  @Expose()
  ids: string[];
}
