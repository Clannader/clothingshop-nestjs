import { CommonResult } from '../../common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { TestSchemaDto } from './test-schema.dto';

export class RespPageSchemaDto<T> extends CommonResult {
  @ApiProperty({
    description: '总数',
  })
  total: number;

  /**
   * 这个泛型估计是无法实现的了,只能这样可以指定类型
   */
  @ApiProperty({
    description: '结果集',
    type: 'array',
    items: {
      $ref: getSchemaPath(TestSchemaDto)
    }
  })
  results: T[];
}
