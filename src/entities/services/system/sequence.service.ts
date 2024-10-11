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
    const typeArray = Utils.enumToArray(SequenceTypeEnum)[1];
    if (!typeArray.includes(type)) {
      return Promise.reject({
        message: this.globalService.serverLang(
          '类型必须在以下值中选其一:{0}',
          'system.typeIsEnum',
          typeArray.join(','),
        ),
        code: CodeEnum.FAIL,
      });
    }
    const where = {
      type,
      shopId,
    };
    // TODO 以后估计要限制shopId的值必须在用户的管理范围内
    const updateFilter = {
      $inc: {
        sequenceId: 1,
      },
    };
    const updateOptions = {
      upsert: true,
    };
    let [err, result] = await this.sequenceModel
      .findOneAndUpdate(where, updateFilter, updateOptions)
      .then((result) => [null, result])
      .catch((err) => [err]);
    if (err) {
      return Promise.reject({
        message: err.message,
        code: CodeEnum.DB_EXEC_ERROR,
      });
    }
    if (!result) {
      // 如果没有值说明是新增的
      result = {
        shopId,
        type,
        sequenceId: 0,
      };
    }
    // 因为拿到的是旧值,为了与数据库同步,加1即可
    result.sequenceId++;
    return Promise.resolve(result);
  }
}
