/**
 * Create by oliver.wu 2024/9/30
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TestStudent } from './testStudent.schema';
import { TestTeacher } from './testTeacher.schema';

@Schema({ discriminatorKey: 'type' }) // 这里的discriminatorKey是填的是关联的字段名
export class TestPerson {
  @Prop({
    type: String,
    required: true,
    enum: [TestStudent.name, TestTeacher.name],
  })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  sex: string;
}

export const TestPersonSchema = SchemaFactory.createForClass(TestPerson);

TestPersonSchema.statics.getAliasName = function () {
  return 'TestPerson';
};

export interface TestPersonModel extends Model<TestPerson> {
  getAliasName(): string;
}
