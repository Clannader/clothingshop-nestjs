/**
 * Create by oliver.wu 2024/9/30
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonPerson } from './testPerson.schema';

@Schema()
export class TestStudent extends CommonPerson {
  @Prop()
  score: number;
}

export const TestStudentSchema = SchemaFactory.createForClass(TestStudent);

TestStudentSchema.statics.getAliasName = function () {
  return 'TestStudent';
};

export interface TestStudentModel extends Model<TestStudent> {
  getAliasName(): string;
}
