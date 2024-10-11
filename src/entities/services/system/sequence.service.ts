/**
 * Create by oliver.wu 2024/10/10
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SequenceModel, Sequence } from '../../schema';

@Injectable()
export class SequenceSchemaService {
  @InjectModel(Sequence.name)
  private sequenceModel: SequenceModel;

  getModel() {
    return this.sequenceModel;
  }

  async getNextSequence(type: string, shopId = 'SYSTEM') {
    const where = {
      type,
      shopId,
    };
    const updateFilter = {
      $inc: {
        sequenceId: 1,
      },
    };
    const updateOptions = {
      upsert: true,
    };
    const [err, result] = await this.sequenceModel
      .findOneAndUpdate(where, updateFilter, updateOptions)
      .then((result) => [null, result])
      .catch((err) => [err]);
    if (err) {
      return Promise.reject(err);
    }
    return Promise.resolve(result);
  }
}
