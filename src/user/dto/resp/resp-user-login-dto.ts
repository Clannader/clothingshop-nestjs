import { CommonResult } from '../../../common';
import { SessionDto } from '../session.dto';

export class RespUserLoginDto extends CommonResult {
  /**
   * 系统凭证
   */
  credential: string;

  /**
   * 用户账号准备过期的提示信息
   */
  expireMsg: string;

  /**
   * session对象
   */
  session: SessionDto;
}
