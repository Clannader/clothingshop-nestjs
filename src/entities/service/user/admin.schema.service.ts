/**
 * Create by CC on 2022/6/9
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AdminModel, Admin } from '../../schema';
import { GlobalService, Utils, CodeEnum } from '@/common';

type LoginResult = {
  message?: string;
  code: number;
  adminInfo: Admin;
};

@Injectable()
export class AdminSchemaService {
  @InjectModel(Admin.name)
  private adminModel: AdminModel;

  @Inject()
  private globalService: GlobalService;

  getModel() {
    return this.adminModel;
  }

  loginSystem(adminId: string): Promise<LoginResult> {
    if (Utils.isEmpty(adminId)) {
      return Promise.reject({
        message: this.globalService.serverLang(
          '用户名不能为空',
          'admin.invUserName',
        ),
        code: CodeEnum.EMPTY,
      });
    }
  }
}
