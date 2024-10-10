/**
 * Create by oliver.wu 2024/10/10
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { SystemConfigModel, SystemConfig } from '../../schema';

@Injectable()
export class SystemConfigSchemaService {
  @InjectModel(SystemConfig.name)
  private systemConfigModel: SystemConfigModel;

  getModel() {
    return this.systemConfigModel;
  }
}
