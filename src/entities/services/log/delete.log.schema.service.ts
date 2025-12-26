/**
 * Create by oliver.wu 2024/10/22
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { DeleteLogModel, DeleteLog } from '../../schema';

import { omit } from 'lodash';

type CreateDeleteLog = DeleteLog & {
  id: string;
};

@Injectable()
export class DeleteLogSchemaService {
  @InjectModel(DeleteLog.name)
  private readonly deleteLogModel: DeleteLogModel;

  getModel() {
    return this.deleteLogModel;
  }

  createDeleteLog(log: CreateDeleteLog) {
    log.deleteDate = new Date();
    const where = {
      _id: log.id,
    };
    const update = {
      $set: omit(log, 'id'),
    };
    // 这里之所以不使用create,使用updateOne是为了插入deleteLog的记录的_id和传入的删除记录的_id一致
    // 以后也可以考虑是否使用insertOne
    return this.deleteLogModel.updateOne(where, update, { upsert: true });
  }
}
