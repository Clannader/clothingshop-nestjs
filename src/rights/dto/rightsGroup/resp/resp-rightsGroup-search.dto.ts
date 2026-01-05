/**
 * Create by oliver.wu 2025/12/26
 */
import { ListRightsGroupDto } from '../list-rightsGroup.dto';
import { CommonResult } from '@/common';

export class RespRightsGroupSearchDto extends CommonResult {
  /**
   * 权限组列表
   */
  rightsGroups: ListRightsGroupDto[];

  /**
   * 总数
   */
  total: number;
}
