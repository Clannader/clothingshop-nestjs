import { UserTypeEnum } from '@/common';
// import { ApiProperty } from '@nestjs/swagger';

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
   * 用户类型:(SYSTEM=系统用户,OTHER=其他用户,3RD=第三方接口用户)
   */
  adminType: UserTypeEnum;

  /**
   * 用户所能访问的所有店铺集合
   */
  shopId: string[];

  /**
   * 用户权限列表
   */
  rights: string[];

  /**
   * 用户邮箱
   */
  email: string;
}
