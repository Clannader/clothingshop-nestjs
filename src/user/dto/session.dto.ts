import { UserTypeEnum } from '../../common';

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
   * 用户类型:(SYSTEM=系统用户,NORMAL=普通用户,3RD=第三方接口用户)
   */
  adminType: UserTypeEnum;

  /**
   * 上次登录时间
   */
  lastTime: string;

  /**
   * 是否第一次登录
   */
  isFirstLogin: boolean;

  /**
   * 是否使用手机设备登录
   */
  mobile: boolean;
}
