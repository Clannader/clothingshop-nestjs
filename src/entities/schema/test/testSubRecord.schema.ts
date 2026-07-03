/**
 * Create by oliver.wu 2026/7/3
 * 测试子文档操作
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

@Schema()
export class TestSubRecord {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string; // 子文档名称

  @Prop({
    type: String,
    trim: true,
  })
  phone: string; // 测试字段-电话
}

export type TestSubRecordDocument = HydratedDocument<TestSubRecord>;
export const TestSubRecordSchema = SchemaFactory.createForClass(TestSubRecord);
TestSubRecordSchema.statics.getAliasName = function () {
  return 'TestSubRecord';
};
export interface TestSubRecordModel extends Model<TestSubRecord> {
  getAliasName(): string;
}
