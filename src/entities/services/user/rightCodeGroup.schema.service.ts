/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RightCodeGroupModel, RightCodeGroup } from '../../schema';

@Injectable()
export class RightCodeGroupSchemaService {
  @InjectModel(RightCodeGroup.name)
  private rightCodeGroupModel: RightCodeGroupModel;

  getModel() {
    return this.rightCodeGroupModel;
  }
}
