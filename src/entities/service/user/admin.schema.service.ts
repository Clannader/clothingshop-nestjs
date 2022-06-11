/**
 * Create by CC on 2022/6/9
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AdminModel, Admin } from '../../schema';
import {
  GlobalService,
  Utils,
  CodeEnum,
  LoginResult,
  userNameExp,
  mailExp,
} from '@/common';

type LoginWhere = {
  email?: string;
  adminId?: object;
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

  async loginSystem(adminId: string): Promise<LoginResult> {
    if (Utils.isEmpty(adminId)) {
      return Promise.reject({
        message: this.globalService.serverLang(
          '用户名不能为空',
          'user.isEmptyUserName',
        ),
        code: CodeEnum.EMPTY,
      });
    }
    if (!adminId.match(userNameExp)) {
      return Promise.reject({
        message: this.globalService.serverLang(
          '用户名含有非法字符',
          'user.invUserName',
        ),
        code: CodeEnum.FAIL,
      });
    }
    const matches = adminId.match('^(.+)@(.+)$');
    // let loginShop = '';
    const where: LoginWhere = {};
    if (adminId.match(mailExp)) {
      where.email = adminId;
    } else if (matches) {
      where.adminId = Utils.getIgnoreCase(matches[1]);
      // loginShop = matches[2];
    } else {
      where.adminId = Utils.getIgnoreCase(adminId);
    }
    // 通过上面的条件查询用户表
    const findOneResult = await this.adminModel
      .findOne(where)
      .lean()
      .then((resp) => [null, resp])
      .catch((err) => [err]);
    const err = findOneResult[0];
    let adminInfo = findOneResult[1];
    if (err) {
      return Promise.reject({
        message: err.message,
        code: CodeEnum.UNKNOWN,
      });
    }
    if (Utils.isEmpty(adminInfo)) {
      // 如果是空的,需要判断是否是supervisor登录
      if (Utils.isSupervisor({ adminId, orgRights: [] })) {
        const [createErr, superInfo] = await this.adminModel
          .create(Utils.getSuper())
          .then((resp) => [null, resp])
          .catch((err) => [err]);
        if (createErr) {
          return Promise.reject({
            message: createErr.message,
            code: CodeEnum.UNKNOWN,
          });
        }
        adminInfo = superInfo;
      } else {
        return Promise.reject({
          message: this.globalService.serverLang(
            '用户名或密码错误',
            'user.invPws',
          ),
          code: CodeEnum.FAIL,
        });
      }
    }
    return Promise.resolve({
      adminInfo,
      shopInfo: null,
      code: CodeEnum.SUCCESS,
    });
  }
}
