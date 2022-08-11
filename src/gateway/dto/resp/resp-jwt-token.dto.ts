/**
 * Create by CC on 2022/8/9
 */
import { CommonResult } from '@/common';
import { ApiProperty } from '@nestjs/swagger';

export class RespJwtTokenDto extends CommonResult {
  @ApiProperty({
    description: 'JWT Token,获取后放到header的Authorization中',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token失效时,用于刷新Token',
  })
  refreshToken: string;
}
