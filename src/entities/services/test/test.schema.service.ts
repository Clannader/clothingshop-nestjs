/**
 * Create by oliver.wu 2024/9/30
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  TestStudentModel,
  TestStudent,
  TestPersonModel,
  TestPerson,
  TestTeacherModel,
  TestTeacher,
} from '../../schema';

@Injectable()
export class TestSchemaService {
  @InjectModel(TestPerson.name)
  private testPersonModel: TestPersonModel;

  @InjectModel(TestTeacher.name)
  private testTeacherModel: TestTeacherModel;

  @InjectModel(TestStudent.name)
  private testStudentModel: TestStudentModel;

  testFindList() {
    console.log('11111');
  }
}
