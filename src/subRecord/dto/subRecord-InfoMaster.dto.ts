/**
 * Create by oliver.wu 2026/7/6
 */
import { Expose } from 'class-transformer';
import { SubRecordModifyMasterDto } from './subRecord-ModifyMaster.dto';
import { SubRecordOrderListDto } from './subRecord-OrderList.dto';
import { SubRecordMonitorDto } from './subRecord-monitor.dto';

import { IsDefined, IsArray } from 'class-validator';

export class SubRecordInfoMasterDto extends SubRecordModifyMasterDto {
  /**
   * 创建时间
   */
  @Expose()
  createDate: string;

  /**
   * 更新时间
   */
  @Expose()
  updateDate: string;

  /**
   * 订单列表
   */
  @Expose()
  @IsArray()
  @IsDefined()
  orders: SubRecordOrderListDto[];

  /**
   * 监控设置
   */
  @Expose()
  monitor: SubRecordMonitorDto;
}
