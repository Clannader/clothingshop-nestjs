import { CommonResult } from '../../common';
import { ApiProperty } from '@nestjs/swagger';

export class RespPageSchemaDto<T> extends CommonResult {
  @ApiProperty({
    description: '总数',
  })
  total: number;

  @ApiProperty({
    description: '结果集',
  })
  results: T[];
}
