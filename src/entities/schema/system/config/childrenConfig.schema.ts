/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument, Types, Document } from 'mongoose';

import { CommonConfig } from './systemConfig.schema';

@Schema()
export class ChildrenConfig extends CommonConfig {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  groupName: string; // 组名,一级组名为null,二级组名不为null
}

export type ChildrenConfigDocument = HydratedDocument<ChildrenConfig>;

export type ChildrenConfigQuery = (Document<unknown, {}, ChildrenConfig> &
  ChildrenConfig & { _id: Types.ObjectId } & { __v: number })[];

export const ChildrenConfigSchema =
  SchemaFactory.createForClass(ChildrenConfig);

ChildrenConfigSchema.statics.getAliasName = function () {
  return 'ChildrenConfig';
};

export interface ChildrenConfigModel extends Model<ChildrenConfig> {
  getAliasName(): string;
}
