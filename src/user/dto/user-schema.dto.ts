import { AdminType } from '../../common';

export class UserSchemaDto {
  /**
   * 用户ID
   */
  adminId: string;

  /**
   * 用户名
   */
  adminName: string;

  /**
   *用户类型
   */
  adminType: AdminType;

  /**
   *用户所能访问的所有店铺集合
   */
  shopId: string[];

  /**
   *用户权限列表
   */
  rights: string[];

  /**
   *用户邮箱
   */
  email: string;
}
