/**
 * Create by oliver.wu 2024/10/9
 * 系统数据设置基类
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SystemDataTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

// 定义其他公共字段类
export class CommonData {
  @Prop({ required: true, trim: true, default: '' })
  description: string;
}

@Schema({ discriminatorKey: 'type' }) // 这里的discriminatorKey是填的是关联的字段名
export class SystemData extends CommonData {
  @Prop({
    type: String,
    required: true,
    enum: Utils.enumToArray(SystemDataTypeEnum)[1],
  })
  type: string;
}

export const SystemDataSchema = SchemaFactory.createForClass(SystemData);

SystemDataSchema.statics.getAliasName = function () {
  return 'SystemData';
};

SystemDataSchema.virtual('id').get(function () {
  return this._id.toString();
});

export interface SystemDataModel extends Model<SystemData> {
  getAliasName(): string;
}
