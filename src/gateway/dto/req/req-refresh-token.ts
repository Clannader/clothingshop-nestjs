/**
 * Create by CC on 2022/8/9
 */
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReqRefreshToken {
  /**
   * 授权时获取到的token
   */
  @IsNotEmpty({
    message: 'user.isEmptyToken',
  })
  @IsString()
  @Expose()
  accessToken: string;
}
