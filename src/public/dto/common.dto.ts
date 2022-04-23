import { CodeEnum } from '../enum/common.enum';

export class CommonResult {
  /**
   * 响应代码
   */
  code: number = CodeEnum.EMPTY;

  /**
   * 错误信息
   */
  msg?: string;
}
