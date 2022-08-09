/**
 * Create by CC on 2022/8/9
 */
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReqRefreshTokenDto {
  @ApiProperty({
    description: '授权时获取到的refreshToken',
  })
  @IsNotEmpty({
    message: 'user.isEmptyToken',
  })
  @IsString()
  @Expose()
  refreshToken: string;
}
