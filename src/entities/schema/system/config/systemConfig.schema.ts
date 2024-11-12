/**
 * Create by oliver.wu 2024/10/9
 * 系统INI数据配置
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { SystemConfigTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';
import { codeExp } from '@/common';

import { SecretSchema } from '../../secret.schema';

export class CommonConfig {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  shopId: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: codeExp,
  })
  key: string; // 配置的Key

  @Prop({
    type: String,
  })
  value: string; // 配置的value,普通明文数据

  @Prop({
    type: Boolean,
    default: false,
  })
  isEncrypt: boolean; // 数据值是否加密

  @Prop({
    type: SecretSchema,
  })
  secretValue: SecretSchema; // 如果是敏感数据,加密后存入,如果正常返回就value:*****

  @Prop({
    type: String,
    trim: true,
    validate: [
      function (value: string) {
        return value.length <= 150;
      },
      'Description length is more than 150.',
    ],
    default: '',
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
