import { IsNotEmpty, Matches, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { userNameExp } from '@/common';
import { ApiHideProperty } from '@nestjs/swagger';

export class ReqUserLoginDto {
  /**
   * 用户ID,支持邮箱,用户ID以及用户ID@单个店铺ID登录
   */
  @IsNotEmpty({
    message: 'user.isEmptyUserName',
  })
  @Matches(userNameExp, { message: 'user.invUserName' })
  @IsString()
  @Expose()
  adminId: string;

  /**
   * 密码
   */
  @IsNotEmpty({
    message: 'user.isEmptyPassword',
  })
  @IsString()
  @Expose()
  adminPws: string;

  // @ApiProperty({
  //   description: '登录时是否允许第三方用户登录,该字段内部调用,不公开',
  //   required: false,
  //   default: false
  // })
  @ApiHideProperty()
  allowThirdUser?: boolean = false;
}
