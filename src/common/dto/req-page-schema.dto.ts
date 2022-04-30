import { SortEnum } from '../enum';

export class ReqPageSchemaDto {
  /**
   * 查询条件,按空格分隔可查询多个条件
   */
  condition?: string;

  /**
   * 页码,设置查询第几页数据
   * @default 1
   */
  offset?: number = 1;

  /**
   * 每页返回数
   * @default 30
   */
  pageSize?: number = 30;

  /**
   * 排序字段名称
   */
  sortName?: string;

  /**
   * 排序方式,默认降序:(asc=升序,desc=降序)
   */
  orderBy?: SortEnum;
}
