/**
 * Create by oliver.wu 2026/7/3
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { TestSubRecordModel, TestSubRecord } from '../../schema';

@Injectable()
export class TestSubRecordSchemaService {
  @InjectModel(TestSubRecord.name)
  private readonly testSubRecordModel: TestSubRecordModel;

  getModel() {
    return this.testSubRecordModel;
  }
}
