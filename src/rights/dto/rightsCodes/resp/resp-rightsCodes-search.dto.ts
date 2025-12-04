/**
 * Create by oliver.wu 2025/12/4
 */
import { CommonResult } from '@/common';
import { SearchRightsCodesDto } from '../search-rightsCodes.dto';

export class RespRightsCodesSearchDto extends CommonResult {
  /**
   * 权限代码列表
   */
  rightsCodes: SearchRightsCodesDto[];
}
