import { CodeEnum } from '../enum';

export class CommonResult {
  /**
   * 响应代码
   */
  code: number = CodeEnum.SUCCESS;

  /**
   * 错误信息
   */
  msg?: string;

  /**
   * 发生异常时返回的时间戳(零时区格式)
   */
  timestamp?: string;

  /**
   * 发生异常时的请求路径
   */
  path?: string;
}
