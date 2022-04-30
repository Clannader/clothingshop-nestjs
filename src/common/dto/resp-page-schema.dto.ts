import { CommonResult } from './common.dto';

export class RespPageSchemaDto<T> extends CommonResult{
  /**
   * 返回总数
   */
  total: number;

  /**
   * 返回的结果集
   */
  results: Array<T>;
}
