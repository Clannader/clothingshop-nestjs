/**
 * Create by oliver.wu 2026/1/8
 */
import { ListRightsGroupDto } from '../list-rightsGroup.dto';
import { CommonResult } from '@/common';

export class RespRightsGroupSingleDto extends CommonResult {
  /**
   * 权限组详情
   */
  rightsGroupInfo: ListRightsGroupDto;
}
