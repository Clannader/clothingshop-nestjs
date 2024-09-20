/**
 * Create by oliver.wu 2024/9/20
 */
import { CommonResult } from '@/common';

import { DbIndexesDto } from '../db-indexes.dto';

export class RespDbIndexesListDto extends CommonResult {
  /**
   * 索引集合
   */
  indexes: DbIndexesDto[];
}
