/**
 * Create by CC on 2022/6/2
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AdminAccessModel, AdminAccess } from '../../schema';

@Injectable()
export class AdminAccessService {
  @InjectModel(AdminAccess.name)
  private adminAccessModel: AdminAccessModel;

  getModel() {
    return this.adminAccessModel;
  }
}
