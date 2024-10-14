/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonConfig } from './systemConfig.schema';

@Schema()
export class ChildrenConfig extends CommonConfig {
  @Prop()
  groupName: string; // 组名,一级组名为null,二级组名不为null
}

export const ChildrenConfigSchema =
  SchemaFactory.createForClass(ChildrenConfig);

ChildrenConfigSchema.statics.getAliasName = function () {
  return 'ChildrenConfig';
};

export interface ChildrenConfigModel extends Model<ChildrenConfig> {
  getAliasName(): string;
}
