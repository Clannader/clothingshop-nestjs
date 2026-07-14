/**
 * Create by oliver.wu 2026/7/14
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsString, IsNumber } from 'class-validator';

export class SubRecordSubCreateDto {
  /**
   * 商品名
   */
  @Expose()
  @IsString()
  @IsDefined()
  productName: string;

  /**
   * 数量
   */
  @Expose()
  @IsNumber()
  @IsDefined()
  quantity: number;

  /**
   * 价格
   */
  @Expose()
  @IsNumber()
  @IsDefined()
  price: number;
}