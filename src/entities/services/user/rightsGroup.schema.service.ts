/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { RightsGroupModel, RightsGroup } from '../../schema';

@Injectable()
export class RightsGroupSchemaService {
  @InjectModel(RightsGroup.name)
  private readonly rightsGroupModel: RightsGroupModel;

  getModel() {
    return this.rightsGroupModel;
  }
}
