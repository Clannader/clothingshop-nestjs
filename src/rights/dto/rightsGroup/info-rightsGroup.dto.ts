/**
 * Create by oliver.wu 2026/1/8
 */
import { ListRightsGroupDto } from './list-rightsGroup.dto';
import { Expose } from 'class-transformer';

export class InfoRightsGroupDto extends ListRightsGroupDto {
  /**
   * 创建者
   */
  @Expose()
  createUser: string;

  /**
   * 创建时间
   */
  @Expose()
  createDate: Date;

  /**
   * 上一次修改的时间
   */
  @Expose()
  updateDate: Date;

  /**
   * 上一次修改的人
   */
  @Expose()
  updateUser: string;
}
