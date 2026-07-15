/**
 * Create by oliver.wu 2026/7/15
 */
import { ReqBasePageDto } from './req-basePage.dto';
import { Expose } from 'class-transformer';
import { CustomValidation } from '../decorator';
import { SortEnum } from '../enum';

export class ReqBaseSortPageDto extends ReqBasePageDto {
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
    enum: ['asc', 'desc'],
  })
  orderBy?: SortEnum;
}
