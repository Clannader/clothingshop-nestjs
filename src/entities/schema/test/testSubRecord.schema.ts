/**
 * Create by oliver.wu 2026/7/3
 * 测试子文档操作
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Model,
  HydratedDocument,
  Types,
  HydratedSingleSubdocument,
  model,
} from 'mongoose';

@Schema({
  // autoIndex: true,
  versionKey: 'v',
  timestamps: true,
})
export class TestSubOrder {
  // 商品名
  @Prop({
    type: String,
    trim: true,
    required: true,
    // unique: true, // 如果这里加索引,是全部数据的子文档都不能有相同的,而不是单独一条记录的子文档不能有相同的,所以不可取,只能通过业务层来判断重复了
  })
  productName: string;

  // 数量
  @Prop({
    type: Number,
    trim: true,
    required: true,
    default: 1,
  })
  quantity: number;

  // 价格
  @Prop({
    type: Types.Double,
    trim: true,
    required: true,
  })
  price: number;

  createdAt: Date;
  updatedAt: Date;
  v: number;
  // id: string; // 子文档的_id没办法映射成虚拟id,需要考虑如何获取
}

@Schema()
export class TestSubMonitor {
  // 最大订单数,10个
  @Prop({
    type: Number,
    trim: true,
    required: true, // 可以通过这些属性添加校验
  })
  maxOrders: number;

  // 最大日志量,100条
  @Prop({
    type: Number,
    trim: true,
  })
  maxLogs: number;

  // 监控间隔时间, 单位s, 默认30
  @Prop({
    type: Number,
    trim: true,
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
  orders: Types.DocumentArray<TestSubOrder>;

  @Prop({
    type: TestSubMonitor,
    // default: () => ({
    //   // maxOrders: 5,
    // }), // 这种Nested path的子文档,因为没有办法new Doc(),只能初始化的时候创建一个空的,后面自定义add字段进去了
    // 后面发现可以new Doc()了, 就是new NewTestSubRecordModel()
  })
  monitor: HydratedSingleSubdocument<TestSubMonitor>;

  // 如果使用timestamps: true,自动生成createdAt 和 updatedAt的话,需要声明这2个字段,不需要@Prop,否则类型无法点出这2个字段
  // 如果不设置自动生成,则需要使用@Prop来声明字段
  // 如果重命名__v,估计也需要声明字段才能使用类型点出字段值
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// 测试的方向：
// 1. 2种方式引入子文档,创建子文档时看是否能校验字段
// 2. 查询分页子文档,多进程创建子文档(漏洞:可能会创建多个),删除修改子文档等操作

export type TestSubRecordDocument = HydratedDocument<TestSubRecord>;
export type TestSubOrderDocument = HydratedDocument<TestSubOrder>;

export const TestSubRecordSchema = SchemaFactory.createForClass(TestSubRecord);
TestSubRecordSchema.statics.getAliasName = function () {
  return 'TestSubRecord';
};
export interface TestSubRecordModel extends Model<TestSubRecord> {
  getAliasName(): string;
}

// 子文档声明类型
type THydratedTestSubRecordDocument = {
  monitor?: HydratedSingleSubdocument<TestSubMonitor>;
  orders?: Types.DocumentArray<TestSubOrder>;
  // 如果有多个这种子文档,估计继续往下写定义多个即可???
};
type NewTestSubRecordType = Model<
  TestSubRecord,
  {},
  {},
  {},
  THydratedTestSubRecordDocument
>;
export const NewTestSubRecordModel = model<TestSubRecord, NewTestSubRecordType>(
  'TestSubRecord',
  TestSubRecordSchema,
);
