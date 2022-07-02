// import { TestSchemaDto } from './test-schema.dto';

export class ReqTestSchemaDto {
  /**
   * 测试字段
   */
  testField: string;

  /**
   * 测试数字
   */
  testNumber: number;

  /**
   * 测试对象
   * 如果是post 请求就可以转换成对象,如果是get 请求那么就会把对象的字段拆分
   */
  // testObject: TestSchemaDto;
}
