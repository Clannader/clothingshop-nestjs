/**
 * Create by oliver.wu 2025/12/30
 */
import { CreateRightsGroupDto } from './create-rightsGroup.dto';
import { Expose } from 'class-transformer';

export class ListRightsGroupDto extends CreateRightsGroupDto {
  /**
   * ID
   */
  @Expose()
  id: string;

  /**
   * 权限组类型
   */
  @Expose()
  groupType: string;
}
