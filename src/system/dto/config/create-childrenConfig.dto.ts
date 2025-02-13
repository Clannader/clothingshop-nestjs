/**
 * Create by oliver.wu 2025/2/12
 */
import { CreateParentConfigDto } from './create-parentConfig.dto';
import { Expose } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class CreateChildrenConfigDto extends CreateParentConfigDto {
  /**
   * 父级的组名
   */
  @IsDefined()
  @IsString()
  @Expose()
  groupName: string;
}
