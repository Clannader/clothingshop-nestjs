/**
 * Create by oliver.wu 2024/10/9
 * 系统数据设置基类
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SystemDataTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';
import { WriteLog } from '@/common/decorator';

// 定义其他公共字段类
export class CommonData {
  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  @WriteLog({
    origin: '描述',
    key: 'system.description',
  })
  description: string;

  @Prop({
    type: String,
    trim: true,
    required: true,
  })
  createUser: string; // 创建者,第一次创建数据的人,不会被修改

  @Prop({
    type: Date,
    required: true,
    default: new Date(),
  })
  createDate: Date; // 创建时间,不会被修改

  @Prop({
    type: Date,
  })
  @WriteLog({
    origin: '更新时间',
    key: 'system.updateDate',
  })
  updateDate: Date; // 上一次更新时间

  @Prop({
    type: String,
    trim: true,
  })
  @WriteLog({
    origin: '更新用户',
    key: 'system.updateUser',
  })
  updateUser: string; // 上一次更新数据的人,更新者
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

// SystemDataSchema.virtual('id').get(function () {
//   return this._id.toString();
// });

export interface SystemDataModel extends Model<SystemData> {
  getAliasName(): string;
}
