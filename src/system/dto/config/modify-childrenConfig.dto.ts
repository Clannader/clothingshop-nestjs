/**
 * Create by oliver.wu 2025/3/27
 */
import { CreateChildrenConfigDto } from './create-childrenConfig.dto';
import { Expose } from 'class-transformer';

export class ModifyChildrenConfigDto extends CreateChildrenConfigDto {
  /**
   * 唯一ID值
   */
  @Expose()
  id: string;
}
