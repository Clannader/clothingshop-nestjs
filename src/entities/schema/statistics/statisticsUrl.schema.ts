/**
 * Create by oliver.wu 2025/12/18
 * 统计请求url次数
 */
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class StatisticsUrl {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  shopId: string; // 店铺ID

  @Prop({
    type: Date,
    required: true,
  })
  date: Date; // 统计时间

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  url: string; // 请求地址

  @Prop({
    type: String,
    required: true,
  })
  serverName: string; // 服务器名

  @Prop({
    type: String,
    required: true,
    default: '1',
  })
  workerId: string; // 服务器的进程ID号
}

export const StatisticsUrlSchema = SchemaFactory.createForClass(StatisticsUrl);

StatisticsUrlSchema.statics.getAliasName = function () {
  return 'StatisticsUrlCount';
};

export interface StatisticsUrlModel extends Model<StatisticsUrl> {
  getAliasName(): string;
}
