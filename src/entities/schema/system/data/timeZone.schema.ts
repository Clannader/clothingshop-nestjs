/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, InferRawDocType } from 'mongoose';

import { CommonData } from './systemData.schema';
import { timeZoneExp } from '@/common';

@Schema()
export class TimeZoneData extends CommonData {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  timeZone: string; // 时区名称

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: timeZoneExp,
  })
  summer: string; // 夏令时

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: timeZoneExp,
  })
  winter: string; // 冬令时

  // 只有使用@Prop()定义的字段才会存到数据库中
  // 没有@Prop()时的字段是不会存到数据库的
  // @Prop()和虚拟字段不能冲突
  // 如果定义虚拟字段时,又定义@Prop()会提示报错
  // winterLabel: string;

  // 虚拟字段定义例子,直接在该类上定义字段名和类型即可,mongoose默认每个表都加上了虚拟字段id=_id.toString(),所以不用定义
  // 如果是其他虚拟字段的,则按下面的方式定义即可
  // id: string;
}

export type TimeZoneDataDocument = HydratedDocument<TimeZoneData>;

// 如果使用lean时返回类型用这个
export type RawTimeZoneDataDocument = InferRawDocType<TimeZoneData>;

export const TimeZoneDataSchema = SchemaFactory.createForClass(TimeZoneData);

TimeZoneDataSchema.statics.getAliasName = function () {
  return 'TimeZoneData';
};

export interface TimeZoneDataModel extends Model<TimeZoneData> {
  getAliasName(): string;
}
