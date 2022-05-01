import { RespPageSchemaDto } from './resp-page-schema.dto';
import { TestSchemaDto } from './test-schema.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RespTestSchemaDto extends RespPageSchemaDto<TestSchemaDto> {
  /**
   * 额外字段
   */
  @ApiProperty({
    description: '额外字段',
  })
  rows: number;

  /**
   * 单独对象
   * 如果是post 请求需要使用修饰器ApiProperty,如果是get 请求可以依旧使用注释注解
   */
  @ApiProperty({
    description: '单独对象',
  })
  schema: TestSchemaDto;

  @ApiProperty({
    description: '数据集合',
  })
  list: TestSchemaDto[];
}
