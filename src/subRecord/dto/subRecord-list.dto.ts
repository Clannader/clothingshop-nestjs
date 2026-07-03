/**
 * Create by oliver.wu 2026/7/3
 */
import { Expose } from 'class-transformer';

export class SubRecordListDto {
  /**
   * 商品名
   */
  @Expose()
  productName: string;

  /**
   * 数量
   */
  @Expose()
  quantity: number;

  /**
   * 价格
   */
  @Expose()
  price: BigInt;
}
