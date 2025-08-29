/**
 * Create by oliver.wu 2024/10/9
 * 系统INI数据配置
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { SystemConfigTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';
import { configKeyExp } from '@/common';

import { SecretSchema } from '../../secret.schema';
import { WriteLog } from '@/common/decorator';
import { CommonData } from '@/entities/schema';

export class CommonConfig {
  @Prop({
    type: String,
    required: true,
    trim: true,
    default: 'SYSTEM',
  })
  shopId: string = 'SYSTEM';

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: configKeyExp,
  })
  @WriteLog({
    origin: '参数Key',
    key: 'system.parameterKey',
  })
  key: string; // 配置的Key

  @Prop({
    type: String,
    required: true,
    default: '',
  })
  @WriteLog({
    origin: '参数值',
    key: 'system.parameterValue',
  })
  value: string; // 配置的value,普通明文数据

  @Prop({
    type: Boolean,
    default: false,
  })
  @WriteLog({
    origin: '是否加密',
    key: 'system.isEncrypted',
  })
  isEncrypt: boolean; // 数据值是否加密

  // import { Types } from 'mongoose';
  // Types.Subdocument就会有其他类型值出现
  @Prop({
    type: SecretSchema,
  })
  @WriteLog({
    origin: '参数密文',
    key: 'system.parameterSecretText',
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
  @WriteLog({
    origin: '描述',
    key: 'system.description',
  })
  description: string; // 配置的描述

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
  return 'SystemConfig';
};

SystemConfigSchema.statics.syncSaveDBObject = async function <
  T extends CommonConfig,
>(dbDataDocs: HydratedDocument<T>): Promise<HydratedDocument<T>> {
  const [err, result] = await Utils.toPromise(dbDataDocs.save());
  if (err) {
    // 版本更新报错,查一遍最新数据
    const [err2, newResult] = await Utils.toPromise<HydratedDocument<T>>(
      this.findById(dbDataDocs.id, { __v: 1 }),
    );
    if (err2) {
      throw err2;
    }
    dbDataDocs.__v = newResult.__v;
    return dbDataDocs.save();
  }
  return result;
};

export interface SystemConfigModel extends Model<SystemConfig> {
  getAliasName(): string;
  syncSaveDBObject<T extends CommonData>(
    dbDataDocs: HydratedDocument<T>,
  ): Promise<HydratedDocument<T>>;
}
