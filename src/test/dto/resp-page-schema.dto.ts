import { CommonResult } from '../../common';

export class RespPageSchemaDto<T> extends CommonResult{

  /**
   * 总数
   */
  total: number;

  /**
   * 结果集
   */
  results: T[];
}
