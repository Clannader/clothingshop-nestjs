import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { sign } from 'cookie-signature';
import { AopLogger } from '@/logger';
import {
  CodeEnum,
  CommonResult,
  GlobalService,
  RequestSession,
  Utils,
  UserTypeEnum,
  UpdateLoginWhere,
  sessionSecret,
  CmsSession,
} from '@/common';
import {
  ReqUserLoginDto,
  RespUserLoginDto,
  ReqUserSearchDto,
  RespUserSearchDto,
  UserSessionDto,
} from './dto';
import { AdminSchemaService, Admin, LoginResult } from '@/entities';

@Injectable()
export class UserService {
  private readonly logger = new AopLogger(UserService.name);

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly adminSchemaService: AdminSchemaService;

  getUsersList(params: ReqUserSearchDto): RespUserSearchDto {
    this.logger.log(params);
    const resp = new RespUserSearchDto();
    resp.code = 100;
    return resp;
  }

  async userLogin(
    params: ReqUserLoginDto,
    req: RequestSession,
  ): Promise<RespUserLoginDto> {
    const adminId = params.adminId;
    const password = params.adminPws;
    const loginResult = await this.adminSchemaService
      .loginSystem(adminId)
      .then((result) => [null, result])
      .catch((err) => [err]);
    const err = loginResult[0];
    const result: LoginResult = loginResult[1];
    const resp = new RespUserLoginDto();
    if (err) {
      resp.msg = err.message;
      resp.code = err.code;
      return resp;
    }

    const admin: Admin = result.adminInfo;
    const shop = result.shopInfo; // 以后如果@店铺进来的话,这个shopInfo就是@的店铺信息
    const otherInfo = result.otherInfo; // 这个其他信息就是展开权限和展开店铺组的其他额外计算信息
    let isUpdate = false; // 判断是否更新用户信息
    const updateWhere: UpdateLoginWhere = {}; // 用户更新条件
    let retryNumber = admin.retryNumber || 0;
    let lockTime = admin.lockTime;
    const expireTime = admin.expireTime;
    let expireMsg: string = undefined; // 用户准备过期时返回提示

    if (!Utils.isEmpty(lockTime)) {
      if (moment().isBefore(moment(lockTime))) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          '该用户已锁定于{0}',
          'user.lockTime',
          moment(lockTime).format('YYYY-MM-DD HH:mm:ss,SSS'),
        );
        return resp;
      } else {
        retryNumber = 0; //锁过期之后,重设次数为0
        lockTime = null;
      }
    }

    if (admin.password !== password) {
      retryNumber++;
      if (retryNumber >= 10) {
        // 输入错误第十次锁定用户
        lockTime = moment().add(10, 'minutes').toDate();
      }
      updateWhere.retryNumber = retryNumber;
      updateWhere.lockTime = lockTime;
      isUpdate = true;
      if (retryNumber <= 5) {
        resp.msg = this.globalService.serverLang(
          '用户名或密码错误',
          'user.invPassword',
        );
      } else if (retryNumber < 10 && retryNumber > 5) {
        resp.msg = this.globalService.serverLang(
          '用户名或密码错误, 今日还可输错{0}次',
          'user.retryPws',
          10 - retryNumber,
        );
      } else if (retryNumber >= 10) {
        resp.msg = this.globalService.serverLang(
          '该用户已锁定于{0}',
          'user.lockTime',
          moment(lockTime).format('YYYY-MM-DD HH:mm:ss,SSS'),
        );
      }
    } else {
      // 密码正确之后,清空错误次数和锁定时间
      isUpdate = true;
      updateWhere.retryNumber = 0;
      updateWhere.lockTime = null;
    }

    if (Utils.isEmpty(resp.msg)) {
      // 避免密码错误了,还会返回其他的错误信息
      if (admin.adminStatus === false) {
        resp.msg = this.globalService.serverLang(
          '用户未激活',
          'user.invStatus',
        );
      } else if (!admin.adminType || admin.adminType === UserTypeEnum.THIRD) {
        resp.msg = this.globalService.serverLang(
          '第三方用户不能登录系统',
          'user.invUser',
        );
      } else if (shop === null) {
        // 这里判断是否@店铺,是判断shop这个值是不是undefined还是null,undefined就是没有@,null就是@了店铺的
        resp.msg = this.globalService.serverLang(
          '店铺不存在',
          'user.noExistShop',
        );
      } else if (!Utils.isEmpty(expireTime)) {
        if (moment(expireTime).isBefore(moment())) {
          resp.msg = this.globalService.serverLang(
            '该用户已过期',
            'user.expireTime',
          );
        } else {
          // 计算距离过期还有多少天
          const diffDays = moment(expireTime).diff(moment(), 'days');
          if (diffDays >= 1 && diffDays <= 3) {
            expireMsg = this.globalService.serverLang(
              '该用户还有 {0} 天过期,请尽快联系管理员',
              'user.expireMsg',
              diffDays,
            );
          } else if (diffDays === 0) {
            expireMsg = this.globalService.serverLang(
              '该用户今天即将到期,请尽快联系管理员',
              'user.expireTodayMsg',
            );
          }
        }
      }
    }

    const currentDate = new Date();
    if (isUpdate) {
      if (Utils.isEmpty(resp.msg)) {
        // 没有错误信息,才是登录成功,才会记录登录的时间
        updateWhere.loginTime = currentDate;
      }
      await this.adminSchemaService
        .getModel()
        .updateLoginInfo(admin._id.toString(), updateWhere);
    }

    if (!Utils.isEmpty(resp.msg)) {
      resp.code = CodeEnum.FAIL;
      return resp;
    }

    //登录成功写log
    //登录时用cookie做默认语言
    const userAgent = (req.headers['user-agent'] as string) || '';
    const store = req.sessionStore;
    //重新获取一个新的sessionID
    const getRegenerate = function (): Promise<void> {
      return new Promise((resolve) => {
        store.regenerate(req, function () {
          resolve();
        });
      });
    };
    await getRegenerate();
    req.session.adminSession = {
      adminId: admin.adminId,
      adminName: admin.adminName,
      adminType: admin.adminType,
      mobile: userAgent.indexOf('Mobile') !== -1,
      //权限这个也可以每次进来的时候查一遍,避免自己权限被别人更改,没有刷新最新的权限
      //以后会考虑压缩数据,加密后存库,使用参数控制
      //还可以避免数据库内存溢出
      // rights: admin.rights,
      loginTime: currentDate, //这个日期如果在网页显示没有错就可以,如果有错就转格式
      expires: currentDate.getTime(), //有效期
      // activeDate: currentDate.getTime(),//活跃时间
      lastTime: admin.loginTime || currentDate, //上次登录时间
      // language: CGlobal.GlobalLangType,//语言
      shopId: otherInfo.currentShop, //当前登录的店铺ID,如果没有@店铺,那么永远都是SYSTEM,如果@了那就是@的那个值
      // shopList: otherInfo.shopList,//该用户能够操作的店铺ID
      // selfShop: otherInfo.selfShop,//用户自己的店铺ID
      // userImg: '/img/default.jpg',
      requestIP: Utils.getRequestIP(req),
      requestHost: req.headers['host'],
      isFirstLogin: admin.isFirstLogin,
      // supplierCode: admin.supplierCode || '',//集团代码
      // shopName: otherInfo.shopName //店铺名,没有@shopId那么就是没有值
    };
    resp.code = CodeEnum.SUCCESS;
    resp.credential = 's:' + sign(req.sessionID, sessionSecret);
    resp.session = UserService.getTemplateSession(req.session.adminSession);
    resp.expireMsg = expireMsg;
    return resp;
  }

  async userLogout(req: RequestSession): Promise<CommonResult> {
    await this.deleteSession(req);
    const resp = new CommonResult();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  deleteSession(req: RequestSession): Promise<void> {
    delete req.session;
    return new Promise((resolve) => {
      req.sessionStore.destroy(req.sessionID, () => {
        resolve();
      });
    });
  }

  private static getTemplateSession(session: CmsSession): UserSessionDto {
    const result = new UserSessionDto();
    result.adminId = session.adminId;
    result.adminName = session.adminName;
    result.adminType = UserTypeEnum[session.adminType];
    result.lastTime = session.lastTime;
    result.isFirstLogin = session.isFirstLogin;
    result.mobile = session.mobile;
    return result;
  }
}
