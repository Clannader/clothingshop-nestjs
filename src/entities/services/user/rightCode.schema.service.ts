/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RightCode } from '../../schema';
import type { RightCodeModel } from '../../schema';

@Injectable()
export class RightCodeSchemaService {
  @InjectModel(RightCode.name)
  private readonly rightCodeModel: RightCodeModel;

  getModel() {
    return this.rightCodeModel;
  }

  async createRightCode(rightCodeDoc: RightCode) {
    // 暂时这样写能把数据进库再说,后期还需要修改
    const filter = {
      code: rightCodeDoc.code,
    };
    const updateFilter = {
      $set: rightCodeDoc,
    };
    await this.rightCodeModel.findOneAndUpdate(filter, updateFilter, {
      upsert: true,
    });
  }
}
