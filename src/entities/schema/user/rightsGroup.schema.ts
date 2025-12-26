/**
 * Create by CC on 2024/9/19
 * 权限组表
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { groupCodeExp, rightsExp } from '@/common';

@Schema()
export class RightsGroup {
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true, // 唯一
    match: groupCodeExp,
  })
  groupCode: string; // 权限组名代码

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  groupName: string; // 权限组描述

  @Prop({
    type: [String],
    required: true,
    default: [],
    match: rightsExp,
  })
  rightCodes: string[]; // 权限组包含的权限代码

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  createUser: string; // 创建人

  @Prop({
    type: Date,
    required: true,
  })
  createDate: Date; // 创建时间

  @Prop({
    type: Date,
  })
  modifyDate: Date; // 上一次修改的时间

  @Prop({
    type: String,
    trim: true,
  })
  modifyUser: string; // 上一次修改的人
}

export type RightsGroupDocument = HydratedDocument<RightsGroup>;

export const RightsGroupSchema = SchemaFactory.createForClass(RightsGroup);

RightsGroupSchema.statics.getAliasName = function () {
  return 'CmsRightsGroup';
};

export interface RightsGroupModel extends Model<RightsGroup> {
  getAliasName(): string;
}
