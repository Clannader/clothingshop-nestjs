/**
 * Create by oliver.wu 2024/10/9
 * 系统INI数据配置
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { codeExp } from '@/common';

@Schema()
export class SystemConfig {
  @Prop({
    required: true,
  })
  shopId: string;

  @Prop({
    trim: true,
    match: codeExp
  })
  key: string; // 配置的Key

  @Prop()
  value: string; // 配置的value

  @Prop({
    trim: true,
    validate: [function (value: string) {
      return value.length <= 150
    }, 'Description length is more than 150.']
  })
  description: string; // 配置的描述

  @Prop()
  groupName: string; // 组名,一级组名为null,二级组名不为null
}

export type SystemConfigDocument = HydratedDocument<SystemConfig>;

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);

SystemConfigSchema.statics.getAliasName = function () {
  return 'CmsSystemConfig';
}

export interface SystemConfigModel extends Model<SystemConfig> {
  getAliasName(): string;
}