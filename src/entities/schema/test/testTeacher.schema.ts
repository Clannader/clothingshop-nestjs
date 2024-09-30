/**
 * Create by oliver.wu 2024/9/30
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Schema()
export class TestTeacher {
  type: string;
  name: string;
  age: number;
  sex: string;

  @Prop()
  teacherId: string;
}

export const TestTeacherSchema = SchemaFactory.createForClass(TestTeacher);

TestTeacherSchema.statics.getAliasName = function () {
  return 'TestTeacher';
};

export interface TestTeacherModel extends Model<TestTeacher> {
  getAliasName(): string;
}
