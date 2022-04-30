import { AdminType } from '../../public/enum/common.enum';

export class SessionDto {
  /**
   * 用户ID
   */
  adminId: string;

  /**
   * 用户名
   */
  adminName: string;

  /**
   * 用户类型
   */
  adminType: AdminType;

  /**
   * 上次登录时间
   */
  lastTime: string;

  /**
   * 是否是第一次登录
   */
  isFirstLogin: boolean;

  /**
   * 是否是使用手机设备登录
   */
  mobile: boolean;
}
