/**
 * Create by oliver.wu 2026/7/14
 */
import { Expose } from 'class-transformer';
import { IsDefined, IsNumber } from 'class-validator';

export class SubRecordMonitorDto {
  /**
   * 最大订单数
   */
  @Expose()
  @IsNumber()
  @IsDefined()
  maxOrders: number;

  /**
   * 最大日志量
   */
  @Expose()
  @IsNumber()
  @IsDefined()
  maxLogs: number;

  /**
   * 监控间隔时间, 单位s
   */
  @Expose()
  @IsNumber()
  @IsDefined()
  intervalTime: number;
}
