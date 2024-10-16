/**
 * Create by oliver.wu 2024/10/9
 * 系统INI数据配置
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { SystemConfigTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';
import { codeExp } from '@/common';

export class CommonConfig {
  @Prop({
    required: true,
  })
  shopId: string;

  @Prop({
    required: true,
    trim: true,
    match: codeExp,
  })
  key: string; // 配置的Key

  @Prop()
  value: string; // 配置的value

  @Prop({
    trim: true,
    validate: [
      function (value: string) {
        return value.length <= 150;
      },
      'Description length is more than 150.',
    ],
  })
  description: string; // 配置的描述
}

@Schema({ discriminatorKey: 'type' })
export class SystemConfig extends CommonConfig {
  @Prop({
    type: String,
    required: true,
    enum: Utils.enumToArray(SystemConfigTypeEnum)[1],
  })
  type: string;
}

export type SystemConfigDocument = HydratedDocument<SystemConfig>;

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);

SystemConfigSchema.statics.getAliasName = function () {
  return 'CmsSystemConfig';
};

export interface SystemConfigModel extends Model<SystemConfig> {
  getAliasName(): string;
}
