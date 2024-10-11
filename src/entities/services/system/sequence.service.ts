/**
 * Create by oliver.wu 2024/10/10
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CodeEnum, SequenceTypeEnum } from '@/common/enum';
import { GlobalService, Utils } from '@/common/utils';

import { SequenceModel, Sequence } from '../../schema';

@Injectable()
export class SequenceSchemaService {
  @InjectModel(Sequence.name)
  private sequenceModel: SequenceModel;

  @Inject()
  private globalService: GlobalService;

  getModel() {
    return this.sequenceModel;
  }

  async getNextSequence(type: SequenceTypeEnum, shopId = 'SYSTEM') {
    if (Utils.isEmpty(type)) {
      return Promise.reject({
        message: this.globalService.serverLang(
          '类型不能为空',
          'system.typeIsEmpty',
        ),
        code: CodeEnum.EMPTY,
      });
    }
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
