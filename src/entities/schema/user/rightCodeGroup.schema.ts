/**
 * Create by CC on 2024/9/19
 * 权限组表
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { groupCodeExp, rightsExp } from '@/common';

@Schema()
export class RightCodeGroup {
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

export type RightCodeGroupDocument = HydratedDocument<RightCodeGroup>;

export const RightCodeGroupSchema =
  SchemaFactory.createForClass(RightCodeGroup);

RightCodeGroupSchema.statics.getAliasName = function () {
  return 'CmsRightCodeGroup';
};

export interface RightCodeGroupModel extends Model<RightCodeGroup> {
  getAliasName(): string;
}
