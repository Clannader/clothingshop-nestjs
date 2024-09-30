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

  async testFindList() {
    const obj = {
      name: '111',
      age: 3,
      sex: '1',
      score: 333,
      teacherId: '33232'
    }
    await this.testStudentModel.create(obj)
    await this.testTeacherModel.create(obj)
    this.testPersonModel.find().then(result => {
      // 这里可以查询全部的数据
      console.log(result)
    })
    this.testTeacherModel.find().then(result => {
      // 仅查询Teacher的数据
      console.log(result)
    })
    this.testStudentModel.find().then(result => {
      // 仅查询Student的数据
      console.log(result)
    })
  }
}
