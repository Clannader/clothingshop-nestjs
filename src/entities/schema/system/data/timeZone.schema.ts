/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonData } from './systemData.schema';

@Schema()
export class TimeZoneData extends CommonData {
  @Prop()
  timeZone: string; // 时区名称

  @Prop()
  summer: string; // 夏令时

  @Prop()
  winter: string; // 冬令时
}

export const TimeZoneDataSchema = SchemaFactory.createForClass(TimeZoneData);

TimeZoneDataSchema.statics.getAliasName = function () {
  return 'TimeZoneData';
};

export interface TimeZoneDataModel extends Model<TimeZoneData> {
  getAliasName(): string;
}
