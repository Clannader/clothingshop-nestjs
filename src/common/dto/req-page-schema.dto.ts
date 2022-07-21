import { SortEnum } from '../enum';
import { Expose, Type } from 'class-transformer';
import { CustomValidation } from '../decorator';

export class ReqPageSchemaDto {

  // @Expose()
  // @Type(() => Number) 数组只能声明单一类型
  // array: number[];

  // @Expose()
  // @Type(() => ReqPageSchemaDto)
  // @Transform(({ value }) => {
  //   console.log(value)
  //   return new ReqPageSchemaDto()
  // }, { toClassOnly: true })
  // photos: ReqPageSchemaDto

  /**
   * 查询条件,按空格分隔可查询多个条件
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'string',
  })
  @Type(() => String) // 由于使用get请求,数据转换会变成所有值都是字符串了,使用Type声明转换成什么类型的值
  condition?: string;

  /**
   * 页码,设置查询第几页数据
   * @default 1
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'number',
    min: 1,
    isInt: true
  })
  @Type(() => Number)
  offset?: number = 1;

  /**
   * 每页返回数
   * @default 30
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'number',
    max: 100,
    isInt: true
  })
  @Type(() => Number)
  pageSize?: number = 30;

  /**
   * 排序字段名称
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'string',
  })
  sortName?: string;

  /**
   * 排序方式,默认降序:(asc=升序,desc=降序)
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'string',
    enum: ['asc', 'desc']
  })
  orderBy?: SortEnum;
}
