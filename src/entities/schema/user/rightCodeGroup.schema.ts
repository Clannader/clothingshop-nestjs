/**
 * Create by CC on 2024/9/19
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { groupCodeExp, rightsExp } from '@/common';

@Schema()
export class RightCodeGroup extends Document {
  @Prop({
    required: true,
    trim: true,
    unique: true, // 唯一
    match: groupCodeExp,
  })
  groupCode: string; // 权限组名代码

  @Prop({
    trim: true,
  })
  groupName: string; // 权限组描述

  @Prop({
    default: [],
    match: rightsExp,
  })
  rightCodes: string[]; // 权限组包含的权限代码
}

export const RightCodeGroupSchema =
  SchemaFactory.createForClass(RightCodeGroup);

RightCodeGroupSchema.statics.getAliasName = function () {
  return 'CmsRightCodeGroup';
};

export interface RightCodeGroupModel extends Model<RightCodeGroup> {
  getAliasName(): string;
}
