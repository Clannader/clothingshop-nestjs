/**
 * Create by oliver.wu 2024/9/30
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// 担心有循环依赖的问题,所以定义那个枚举的key可以使用固定写死的字符串,不需要引用其他的schema
// import { TestStudent } from './testStudent.schema';
// import { TestTeacher } from './testTeacher.schema';

// 定义其他公共字段类
export class CommonPerson {
  @Prop({ required: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  sex: string;
}

@Schema({ discriminatorKey: 'type' }) // 这里的discriminatorKey是填的是关联的字段名
export class TestPerson extends CommonPerson {
  @Prop({
    type: String,
    required: true,
    // enum: [TestStudent.name, TestTeacher.name],
    enum: ['TestStudent', 'TestTeacher'],
  })
  type: string;
}

export const TestPersonSchema = SchemaFactory.createForClass(TestPerson);

TestPersonSchema.statics.getAliasName = function () {
  return 'TestPerson';
};

export interface TestPersonModel extends Model<TestPerson> {
  getAliasName(): string;
}
