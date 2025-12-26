/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RightsCode } from '../../schema';
import type { RightsCodeModel } from '../../schema';

@Injectable()
export class RightsCodeSchemaService {
  @InjectModel(RightsCode.name)
  private readonly rightsCodeModel: RightsCodeModel;

  getModel() {
    return this.rightsCodeModel;
  }

  // mergeRightCode(rightCodeDoc: RightCode) {
  //   // 暂时这样写能把数据进库再说,后期还需要修改
  //   const filter = {
  //     code: rightCodeDoc.code,
  //   };
  //   const updateFilter = {
  //     $set: rightCodeDoc,
  //   };
  //   return this.rightCodeModel
  //     .findOneAndUpdate(filter, updateFilter, {
  //       upsert: true,
  //     })
  //     .then((result) => {
  //       return result;
  //     });
  // }
}
