/**
 * Create by CC on 2022/6/19
 */
import { ApiProperty } from '@nestjs/swagger';
import { UserSessionDto } from '@/user/dto';
import { RespPageSchemaDto } from './resp-page-schema.dto';

export class RespObjectDto extends RespPageSchemaDto<UserSessionDto> {
  /**
   * 行数
   */
  @ApiProperty({
    description: '行数',
  })
  rows: number;
}
