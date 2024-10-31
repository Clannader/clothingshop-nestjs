/**
 * Create by oliver.wu 2024/10/30
 */
import { Module } from '@nestjs/common';

import { PersonObj } from './person.obj';
import { StudentObj } from './student.obj';
import { TeacherObj } from './teacher.obj';

@Module({
  providers: [PersonObj, StudentObj, TeacherObj],
  exports: [PersonObj, StudentObj, TeacherObj],
})
export class TestInterfacesModule {}
