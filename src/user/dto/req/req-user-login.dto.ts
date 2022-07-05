import { IsNotEmpty, Matches } from 'class-validator';
import { userNameExp } from '@/common'

export class ReqUserLoginDto {
  /**
   * 用户ID,支持邮箱,用户ID以及用户ID@单个店铺ID登录
   */
  @IsNotEmpty({
    message: 'user.isEmptyUserName',
  })
  @Matches(userNameExp, { message: 'user.invUserName' })
  adminId: string;

  /**
   * 密码
   */
  @IsNotEmpty({
    message: 'user.isEmptyPassword',
  })
  adminPws: string;
}
