/**
 * Create by oliver.wu 2024/10/11
 */

import { SequenceTypeEnum } from '@/common/enum';

export class ReqSequenceResult {
  /**
   * 类型
   */
  type: SequenceTypeEnum;

  /**
   * 店铺ID,默认SYSTEM
   */
  shopId?: string = 'SYSTEM';
}
