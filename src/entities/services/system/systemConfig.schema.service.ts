/**
 * Create by oliver.wu 2024/10/10
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  SystemConfigModel,
  SystemConfig,
  ParentConfig,
  ParentConfigModel,
  ChildrenConfig,
  ChildrenConfigModel,
} from '../../schema';

@Injectable()
export class SystemConfigSchemaService {
  @InjectModel(SystemConfig.name)
  private readonly systemConfigModel: SystemConfigModel;

  @InjectModel(ParentConfig.name)
  private readonly parentConfigModel: ParentConfigModel;

  @InjectModel(ChildrenConfig.name)
  private readonly childrenConfigModel: ChildrenConfigModel;

  getSystemConfigModel() {
    return this.systemConfigModel;
  }

  getParentConfigModel() {
    return this.parentConfigModel;
  }

  getChildrenConfigModel() {
    return this.childrenConfigModel;
  }
}
