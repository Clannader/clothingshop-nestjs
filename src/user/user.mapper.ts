/**
 * Create by CC on 2022/6/29
 * 针对dto和内部实体类的转换
 */

import { CmsSession, UserTypeEnum } from '@/common';
import { UserSessionDto } from './dto';

export class UserMapper {
  public static getTemplateSession(session: CmsSession): UserSessionDto {
    const result = new UserSessionDto();
    result.adminId = session.adminId;
    result.adminName = session.adminName;
    result.adminType = UserTypeEnum[session.adminType];
    result.lastTime = session.lastTime;
    result.isFirstLogin = session.isFirstLogin;
    result.mobile = session.mobile;
    return result;
  }
}
