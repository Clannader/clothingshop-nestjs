/**
 * Create by oliver.wu 2024/10/18
 */
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReqSerializerParamsDto {
  /**
   * 状态
   */
  @ApiProperty({
    name: 'userStatus',
    type: 'boolean',
    description: '用户状态',
  })
  @Expose({ name: 'userStatus' })
  status: boolean;
}
