import { IsNotEmpty } from 'class-validator';

export class ReqUserLoginDto {
  /**
   * 用户ID,支持邮箱,用户ID以及用户ID@单个店铺ID登录
   */
  @IsNotEmpty({
    message: 'user.isEmptyUserName',
  })
  adminId: string;

  /**
   * 密码
   */
  adminPws: string;
}
