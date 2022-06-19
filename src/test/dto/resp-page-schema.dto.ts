import { CommonResult } from '@/common';
import { ApiProperty/*, getSchemaPath*/ } from '@nestjs/swagger';
// import { TestSchemaDto } from './test-schema.dto';

export class RespPageSchemaDto<T> extends CommonResult {
  @ApiProperty({
    description: '总数',
  })
  total: number;

  /**
   * 这个泛型估计是无法实现的了,只能这样可以指定类型
   * 确实有点无奈啊
   */
  @ApiProperty({
    description: '结果集',
    // type: 'array',
    // items: {
    //   $ref: getSchemaPath(TestSchemaDto),
    // },
  })
  results: T[];

  @ApiProperty({
    description: '泛型',
    // allOf: [{
    //   $ref: getSchemaPath(TestSchemaDto),
    // }]
  })
  result: T;

}
