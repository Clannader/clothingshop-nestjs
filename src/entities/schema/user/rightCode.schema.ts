/**
 * Create by CC on 2024/9/19
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

@Schema()
export class RightCode extends Document {
  @Prop({
    required: true,
    trim: true,
  })
  code: string; // 权限内部代码

  @Prop()
  key: string; // 代码中标识的权限的Key

  @Prop()
  description: string; // 权限描述

  @Prop()
  category: string; // 权限类别

  @Prop()
  cnLabel: string; // 权限中文显示

  @Prop()
  enLabel: string; // 权限英文显示
}

// 不懂如何挑选出自定义字段的声明出来,或者可以合并声明等,看以后能力了
export interface RightCodeDoc {
  code: string;
  key: string;
  description: string;
  category: string;
  cnLabel: string;
  enLabel: string;
}

export const RightCodeSchema = SchemaFactory.createForClass(RightCode);

RightCodeSchema.statics.getAliasName = function () {
  return 'CmsRightCode';
};

export interface RightCodeModel extends Model<RightCode> {
  getAliasName(): string;
}
