import { SortEnum } from '../enum';
import { Expose } from 'class-transformer';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class ReqPageSchemaDto {
  /**
   * 查询条件,按空格分隔可查询多个条件
   */
  @Expose()
  @IsString()
  condition?: string;

  /**
   * 页码,设置查询第几页数据
   * @default 1
   */
  @Expose()
  @IsInt()
  @Min(1)
  offset?: number = 1;

  /**
   * 每页返回数
   * @default 30
   */
  @Expose()
  @IsInt()
  @Max(100)
  pageSize?: number = 30;

  /**
   * 排序字段名称
   */
  @Expose()
  @IsString()
  sortName?: string;

  /**
   * 排序方式,默认降序:(asc=升序,desc=降序)
   */
  @Expose()
  @IsString()
  orderBy?: SortEnum;
}
