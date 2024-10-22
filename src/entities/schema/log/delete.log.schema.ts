/**
 * Create by oliver.wu 2024/10/22
 * 记录删除数据的记录表
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

@Schema()
export class DeleteLog {
  @Prop({
    required: true,
    trim: true,
  })
  modelName: string; // 表名

  @Prop({
    required: true,
    trim: true,
  })
  keyWords: string; // 搜索关键字

  @Prop({
    required: true,
  })
  deleteDate?: Date; // 删除时间

  @Prop({
    required: true,
    type: Object,
    default: {},
  })
  searchWhere: Record<string, any>; // 查数据的条件
}

export type DeleteLogDocument = HydratedDocument<DeleteLog>;

export const DeleteLogSchema = SchemaFactory.createForClass(DeleteLog);

DeleteLogSchema.statics.getAliasName = function () {
  return 'DeleteRecord';
};

export interface DeleteLogModel extends Model<DeleteLog> {
  getAliasName(): string;
}
