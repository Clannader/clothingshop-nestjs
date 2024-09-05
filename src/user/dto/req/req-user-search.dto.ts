import {
  ReqPageSchemaDto,
} from '@/common';
import {
  UserStatusEnum,
  UserTypeEnum,
} from '@/common/enum';
import {
  CustomValidation,
} from '@/common/decorator';
import { Expose } from 'class-transformer';

export class ReqUserSearchDto extends ReqPageSchemaDto {
  /**
   * 用户状态:(T=已激活,F=未激活)
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'string',
    enum: ['T', 'F'],
  })
  status?: UserStatusEnum;

  /**
   * 用户类型:(SYSTEM=系统用户,OTHER=其他用户,3RD=第三方接口用户)
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'string',
    enum: ['SYSTEM', 'OTHER', '3RD'],
  })
  type?: UserTypeEnum;
}
