/**
 * Create by CC on 2022/9/17
 */
import { CommonResult } from '@/common';
import { UserSessionDto } from '../user-session.dto';

export class RespUserRolesDto extends CommonResult {
  /**
   * 用户权限值
   */
  roles: string;

  /**
   * 用户原始权限值
   */
  orgRoles: string;

  /**
   * Session对象
   */
  session: UserSessionDto;

  /**
   * 3DES偏移量
   */
  tripleIV: string;
}
