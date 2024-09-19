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
  description: string; // 权限描述

  @Prop()
  category: string; // 权限类别

  @Prop()
  cnLabel: string; // 权限中文显示

  @Prop()
  enLabel: string; // 权限英文显示
}

export const RightCodeSchema = SchemaFactory.createForClass(RightCode);

RightCodeSchema.statics.getAliasName = function () {
  return 'CmsRightCode';
};

export interface RightCodeModel extends Model<RightCode> {
  getAliasName(): string;
}
