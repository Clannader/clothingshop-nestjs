/**
 * Create by CC on 2024/9/19
 * 权限组表
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { groupCodeExp } from '@/common';
import { WriteLog } from '@/common/decorator';

@Schema()
export class RightsGroup {
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true, // 唯一
    match: groupCodeExp,
  })
  @WriteLog({
    origin: '权限组名',
    key: 'rightsGroup.groupCode',
  })
  groupCode: string; // 权限组名代码

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  @WriteLog({
    origin: '权限组描述',
    key: 'rightsGroup.groupName',
  })
  groupName: string; // 权限组描述

  @Prop({
    type: [String],
    required: true,
    default: [],
  })
  @WriteLog({
    origin: '权限代码',
    key: 'rightsGroup.rightCodes',
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
  @WriteLog({
    origin: '上一次修改的时间',
    key: 'rightsGroup.updateDate',
  })
  updateDate: Date; // 上一次修改的时间

  @Prop({
    type: String,
    trim: true,
  })
  @WriteLog({
    origin: '上一次修改的人',
    key: 'rightsGroup.updateUser',
  })
  updateUser: string; // 上一次修改的人
}

export type RightsGroupDocument = HydratedDocument<RightsGroup>;

export const RightsGroupSchema = SchemaFactory.createForClass(RightsGroup);

RightsGroupSchema.statics.getAliasName = function () {
  return 'CmsRightsGroup';
};

export interface RightsGroupModel extends Model<RightsGroup> {
  getAliasName(): string;
}
