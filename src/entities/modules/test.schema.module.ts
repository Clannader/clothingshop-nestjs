/**
 * Create by oliver.wu 2024/9/30
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TestStudent,
  TestPersonSchema,
  TestPerson,
  TestTeacherSchema,
  TestTeacher,
  TestStudentSchema,
} from '../schema';
import { TestSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TestPerson.name,
        schema: TestPersonSchema,
        discriminators: [
          {
            name: TestStudent.name,
            schema: TestStudentSchema,
          },
          {
            name: TestTeacher.name,
            schema: TestTeacherSchema,
          },
        ],
      },
    ]),
  ],
  providers: [TestSchemaService],
  exports: [TestSchemaService],
})
export class TestSchemaModule {}
