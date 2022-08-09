/**
 * Create by CC on 2022/8/9
 */
import { CommonResult } from '@/common';
import { ApiProperty } from '@nestjs/swagger';

export class RespJwtToken extends CommonResult {
  @ApiProperty({
    description: 'JWT Token',
  })
  accessToken: string;
}
