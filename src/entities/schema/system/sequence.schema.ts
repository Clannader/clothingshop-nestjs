/**
 * Create by oliver.wu 2024/10/9
 * 获取唯一序列号
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { SequenceTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

@Schema()
export class Sequence {
  @Prop({
    default: 0,
  })
  sequenceId: number;

  @Prop({
    required: true,
  })
  shopId: string;

  @Prop({
    required: true,
    enum: Utils.enumToArray(SequenceTypeEnum)[1], // 这个校验是有效果的,只不过如果使用findAndUpdate插入是无法触发mongodb内部的校验器的,只能使用create才有效
  })
  type: string;
}

export type SequenceDocument = HydratedDocument<Sequence>;

export const SequenceSchema = SchemaFactory.createForClass(Sequence);

SequenceSchema.statics.getAliasName = function () {
  return 'CmsSequence';
};

export interface SequenceModel extends Model<Sequence> {
  getAliasName(): string;
}
