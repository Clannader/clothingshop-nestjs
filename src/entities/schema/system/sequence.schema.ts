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
    default: 0
  })
  sequenceId: number;

  @Prop()
  shopId: string;

  @Prop({
    enum: Utils.enumToArray(SequenceTypeEnum)[1]
  })
  type: string;
}

export  type SequenceDocument = HydratedDocument<Sequence>;

export const SequenceSchema = SchemaFactory.createForClass(Sequence);

SequenceSchema.statics.getAliasName = function () {
  return 'CmsSequence';
}

export interface SequenceModel extends Model<Sequence> {
  getAliasName(): string;
}