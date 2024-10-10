/**
 * Create by oliver.wu 2024/10/10
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AdminLogModel, AdminLog } from '../../schema';

@Injectable()
export class AdminLogSchemaService {
  @InjectModel(AdminLog.name)
  private adminLogModel: AdminLogModel;

  getModel() {
    return this.adminLogModel;
  }
}
