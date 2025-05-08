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
    return this.deleteLogModel.updateOne(where, update, { upsert: true });
  }
}
