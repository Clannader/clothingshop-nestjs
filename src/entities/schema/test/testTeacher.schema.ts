/**
 * Create by oliver.wu 2024/9/30
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonPerson } from './testPerson.schema';

@Schema()
export class TestTeacher extends CommonPerson {
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
