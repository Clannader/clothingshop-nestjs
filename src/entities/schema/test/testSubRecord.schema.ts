/**
 * Create by oliver.wu 2026/7/3
 * 测试子文档操作
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument, Types } from 'mongoose';

@Schema({
  autoIndex: true,
  versionKey: 'v',
  timestamps: true,
})
export class TestSubOrder {
  // 商品名
  @Prop({
    type: String,
    trim: true,
    required: true,
    unique: true,
  })
  productName: string;

  // 数量
  @Prop({
    type: Number,
    trim: true,
    default: 1,
  })
  quantity: number;

  // 价格
  @Prop({
    type: Types.Double,
    trim: true,
  })
  price: number;
}

@Schema()
export class TestSubMonitor {
  // 最大订单数,10个
  @Prop({
    type: Number,
    trim: true,
    default: 10,
  })
  maxOrders: number;

  // 最大日志量,100条
  @Prop({
    type: Number,
    trim: true,
    default: 100,
  })
  maxLogs: number;

  // 监控间隔时间, 单位s, 默认30
  @Prop({
    type: Number,
    trim: true,
    default: 30,
  })
  intervalTime: number;
}

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

  @Prop({
    type: [TestSubOrder],
  })
  orders: [TestSubOrder];

  @Prop({
    type: TestSubMonitor,
  })
  monitor: TestSubMonitor;

  // 如果使用timestamps: true,自动生成createdAt 和 updatedAt的话,需要声明这2个字段,不需要@Prop,否则类型无法点出这2个字段
  // 如果不设置自动生成,则需要使用@Prop来声明字段
  // 如果重命名__v,估计也需要声明字段才能使用类型点出字段值
  createdAt: Date;
  updatedAt: Date;
  version: number;
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
