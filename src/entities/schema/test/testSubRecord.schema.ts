/**
 * Create by oliver.wu 2026/7/3
 * 测试子文档操作
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

@Schema({
  autoIndex: true, // 要设置这个参数,@Prop下的自动索引才能生效
  versionKey: 'version', // 重命名__v节点名称
  timestamps: true, // 自动生成createdAt 和 updatedAt
})
export class TestSubRecord {
  @Prop({
    type: String,
    required: true, // ""空值无法创建
    trim: true,
    unique: true, // 自动创建唯一索引
  })
  name: string; // 子文档名称

  @Prop({
    type: String,
    trim: true,
  })
  phone: string; // 测试字段-电话
}

// TODO 测试的方向：
// 1. 2种方式引入子文档,创建子文档时看是否能校验字段
// 2. 查询分页子文档,多进程创建子文档(漏洞:可能会创建多个),删除修改子文档等操作

export type TestSubRecordDocument = HydratedDocument<TestSubRecord>;
export const TestSubRecordSchema = SchemaFactory.createForClass(TestSubRecord);
TestSubRecordSchema.statics.getAliasName = function () {
  return 'TestSubRecord';
};
export interface TestSubRecordModel extends Model<TestSubRecord> {
  getAliasName(): string;
}
