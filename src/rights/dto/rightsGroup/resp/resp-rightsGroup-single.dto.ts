/**
 * Create by oliver.wu 2026/1/8
 */
import { InfoRightsGroupDto } from '../info-rightsGroup.dto';
import { CommonResult } from '@/common';

export class RespRightsGroupSingleDto extends CommonResult {
  /**
   * 权限组详情
   */
  rightsGroupInfo: InfoRightsGroupDto;
}
