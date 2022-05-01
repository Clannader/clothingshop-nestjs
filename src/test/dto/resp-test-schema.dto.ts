import { RespPageSchemaDto } from './resp-page-schema.dto';
import { TestSchemaDto } from './test-schema.dto';

export class RespTestSchemaDto extends RespPageSchemaDto<TestSchemaDto> {
  /**
   * 额外字段
   */
  rows: number;
}
