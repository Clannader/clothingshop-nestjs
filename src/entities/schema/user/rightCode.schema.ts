/**
 * Create by CC on 2024/9/19
 * 权限代码表
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { WriteLog } from '@/common/decorator';

@Schema()
export class RightCode {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  code: string; // 权限内部代码

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @WriteLog({
    origin: 'Key',
    key: 'rightsCodes.key',
  })
  key: string; // 代码中标识的权限枚举的Key

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  @WriteLog({
    origin: '权限描述',
    key: 'rightsCodes.dbDescription',
  })
  description: string; // 权限描述

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @WriteLog({
    origin: '分类',
    key: 'rightsCodes.category',
  })
  category: string; // 权限的上一级类别Key

  @Prop({
    type: String,
    trim: true,
  })
  @WriteLog({
    origin: '中文',
    key: 'rightsCodes.dbCnLabel',
  })
  cnLabel: string; // 权限中文显示

  @Prop({
    type: String,
    trim: true,
  })
  @WriteLog({
    origin: '英文',
    key: 'rightsCodes.dbEnLabel',
  })
  enLabel: string; // 权限英文显示

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  @WriteLog({
    origin: '路径',
    key: 'rightsCodes.treePath',
  })
  path: string; // 代码tree的路径,例如x.x.x
}

export type RightCodeDocument = HydratedDocument<RightCode>;

export const RightCodeSchema = SchemaFactory.createForClass(RightCode);

RightCodeSchema.statics.getAliasName = function () {
  return 'CmsRightCode';
};

export interface RightCodeModel extends Model<RightCode> {
  getAliasName(): string;
}
