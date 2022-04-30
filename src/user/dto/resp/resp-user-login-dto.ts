import { CommonResult } from '../../../common';
import { UserSessionDto } from '../user-session.dto';
import { PartialType, ApiProperty } from '@nestjs/swagger';

export class RespUserLoginDto extends PartialType(CommonResult) {
  @ApiProperty({
    description: '系统凭证',
  })
  credential: string;

  @ApiProperty({
    description: '用户账号准备过期的提示信息',
  })
  expireMsg: string;

  /**
   * 很郁闷啊,POST请求的返回值如果含有其他对象时,似乎不能映射出来,好像是使用注释无效导致的
   */
  @ApiProperty({
    description: 'session对象',
  })
  session: UserSessionDto;
}
