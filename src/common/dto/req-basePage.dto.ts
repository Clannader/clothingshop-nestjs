/**
 * Create by oliver.wu 2026/7/15
 */
import { Expose, Type, Transform } from 'class-transformer';
import { CustomValidation } from '../decorator';

export class ReqBasePageDto {
  /**
   * 页码,设置查询第几页数据
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'number',
    min: 1,
    isInt: true,
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    return value ?? 1;
  })
  offset?: number = 1;

  /**
   * 每页返回数
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: 'number',
    max: 100,
    isInt: true,
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    return value ?? 30;
  })
  pageSize?: number = 30;
}
