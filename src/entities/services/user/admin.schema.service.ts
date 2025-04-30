/**
 * Create by CC on 2022/6/9
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AdminModel, Admin } from '../../schema';
import { GlobalService, Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';
import {
  userNameExp,
  LoginResult,
  LanguageType,
  IgnoreCaseType,
} from '@/common';
import validator from 'validator';

type LoginWhere = {
  email?: string;
  adminId?: IgnoreCaseType;
};

@Injectable()
export class AdminSchemaService {
  @InjectModel(Admin.name)
  private readonly adminModel: AdminModel;

  @Inject()
  private readonly globalService: GlobalService;

  getModel() {
    return this.adminModel;
  }

  async loginSystem(
    language: LanguageType,
    adminId: string,
  ): Promise<LoginResult> {
    if (Utils.isEmpty(adminId)) {
      return Promise.reject({
        message: this.globalService.lang(
          language,
          '用户名不能为空',
          'user.isEmptyUserName',
        ),
        code: CodeEnum.EMPTY,
      });
    }
    if (!adminId.match(userNameExp)) {
      return Promise.reject({
        message: this.globalService.lang(
          language,
          '用户名含有非法字符',
          'user.invUserName',
        ),
        code: CodeEnum.FAIL,
      });
    }
    const matches = adminId.match('^(.+)@(.+)$');
    // let loginShop = '';
    let inputAdminId = '';
    const where: LoginWhere = {};
    if (validator.isEmail(adminId)) {
      where.email = adminId;
    } else if (matches) {
      where.adminId = Utils.getIgnoreCase(matches[1]);
      inputAdminId = matches[1];
      // loginShop = matches[2];
    } else {
      where.adminId = Utils.getIgnoreCase(adminId); // 新增正则漏洞测试adminId=xxx|(?:SU).*可以查到SUPERVISOR
      inputAdminId = adminId;
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
    if (
      Utils.isEmpty(adminInfo) ||
      // 这里加这个条件是防止用户名的正则漏洞,虽然可以设计用户名全大写防止不区分大小写登录,但是考虑允许用户大小写的话如何防止这个漏洞
      // 判断查出来的用户和输入的用户名是否一致才算用户名和密码一致
      (inputAdminId &&
        inputAdminId.toUpperCase() !== adminInfo.adminId.toUpperCase())
    ) {
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
          message: this.globalService.lang(
            language,
            '用户名或密码错误',
            'user.invPassword',
          ),
          code: CodeEnum.FAIL,
        });
      }
    }
    return Promise.resolve(<LoginResult>{
      adminInfo,
      shopInfo: 'SYSTEM', //TODO 暂时写死
      code: CodeEnum.SUCCESS,
      otherInfo: {
        currentShop: 'SYSTEM',
        orgRights: adminInfo.rights,
        shopList: [],
      },
    });
  }
}
