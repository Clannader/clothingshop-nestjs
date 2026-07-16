import { Expose, Type } from 'class-transformer';
import { CustomValidation } from '../decorator';
import { ReqBaseSortPageDto } from './req-baseSortPage.dto';

export class ReqPageSchemaDto extends ReqBaseSortPageDto {
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
}
