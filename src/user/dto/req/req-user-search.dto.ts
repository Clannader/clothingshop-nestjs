import { ReqPageSchemaDto, UserStatusEnum, UserTypeEnum } from '@/common';

export class ReqUserSearchDto extends ReqPageSchemaDto {
  /**
   * 用户状态:(T=已激活,F=未激活)
   */
  status?: UserStatusEnum;

  /**
   * 用户类型:(SYSTEM=系统用户,NORMAL=普通用户,3RD=第三方接口用户)
   */
  type?: UserTypeEnum;
}
