/**
 * Create by oliver.wu 2025/2/18
 */
import { CreateParentConfigDto } from './create-parentConfig.dto';
import { Expose } from 'class-transformer';

export class ModifyParentConfigDto extends CreateParentConfigDto {
  /**
   * 唯一ID值
   */
  @Expose()
  id: string;
}
