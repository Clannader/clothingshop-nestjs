// nestjs
import { Inject, Injectable } from '@nestjs/common';
// third party
import * as moment from 'moment';
import { sign } from 'cookie-signature';
// common
import { CodeEnum, UserTypeEnum } from '@/common/enum';
import { ConfigService } from '@/common/config';
import { GlobalService, Utils } from '@/common/utils';
import {
  CommonResult,
  RequestSession,
  CmsSession,
  UpdateLoginWhere,
  LoginResult,
  SECRET_CONFIG,
  LanguageType,
  SecurityOptions,
  sessionSecret,
} from '@/common';
// entity
import { AdminSchemaService } from '@/entities/services';
import { AdminDocument, Admin } from '@/entities/schema';
// service
import { UserSessionService } from './user.session.service';
import { MemoryCacheService } from '@/cache/services';
// other
import { AopLogger } from '@/logger';
import { UserMapper } from './user.mapper';
import { RightsGroupList } from '@/rights';
// self
import {
  ReqUserLoginDto,
  ReqUserSearchDto,
  RespUserSearchDto,
  RespUserRolesDto,
  RespUserLoginDto,
} from './dto';

@Injectable()
export class UserService {
  private readonly logger = new AopLogger(UserService.name);

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly adminSchemaService: AdminSchemaService;

  @Inject()
  private readonly userSessionService: UserSessionService;

  @Inject(SECRET_CONFIG)
  private readonly secretConfig: ConfigService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  async getUsersList(params: ReqUserSearchDto): Promise<RespUserSearchDto> {
    this.logger.log(params);
    const resp = new RespUserSearchDto();
    resp.code = 100;
    return resp;
  }

  async userLogin(
    language: LanguageType,
    params: ReqUserLoginDto,
    securityOptions: SecurityOptions,
  ): Promise<LoginResult> {
    const adminId = params.adminId;
    const securityPassword = params.adminPws; // 新增密码需要客户端加密后传回来
    let password = '';
    if (!params.ssoLogin) {
      password = await this.memoryCacheService.tripleDesDecrypt(
        language,
        securityPassword,
        securityOptions,
      );
    }

    // 事件循环清除会话ID
    // 等待上面的解密完成后,到下一个异步函数之前,删除会话ID
    // process.nextTick(() => {
    //   this.memoryCacheService.removeSecuritySession(securityOptions.securityId);
    // });
    const [err, result] = await Utils.toPromise(
      this.adminSchemaService.loginSystem(language, adminId),
    );
    if (err) {
      return err;
    }

    const admin: AdminDocument = result.adminInfo;
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
        result.code = CodeEnum.FAIL;
        result.message = this.globalService.lang(
          language,
          '该用户已锁定于{0},请在{1}分钟后重试',
          'user.lockTimeBySeconds',
          moment(lockTime).format('YYYY-MM-DD HH:mm:ss,SSS'),
          Math.ceil(moment(lockTime).diff(moment(), 'seconds') / 60),
        );
        return result;
      } else {
        retryNumber = 0; //锁过期之后,重设次数为0
        lockTime = null;
      }
    }

    if (!params.ssoLogin && admin.password !== password) {
      retryNumber++;
      if (retryNumber >= 10) {
        // 输入错误第十次锁定用户
        lockTime = moment().add(10, 'minutes').toDate();
      }
      updateWhere.retryNumber = retryNumber;
      updateWhere.lockTime = lockTime;
      isUpdate = true;
      if (retryNumber < 5) {
        result.message = this.globalService.lang(
          language,
          '用户名或密码错误',
          'user.invPassword',
        );
      } else if (retryNumber < 10 && retryNumber >= 5) {
        result.message = this.globalService.lang(
          language,
          '用户名或密码错误, 今日还可输错{0}次',
          'user.retryPws',
          10 - retryNumber,
        );
      } else if (retryNumber >= 10) {
        result.message = this.globalService.lang(
          language,
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

    if (Utils.isEmpty(result.message)) {
      // 避免密码错误了,还会返回其他的错误信息
      if (admin.adminStatus === false) {
        result.message = this.globalService.lang(
          language,
          '用户未激活',
          'user.invStatus',
        );
      } else if (
        !params.allowThirdUser &&
        admin.adminType === UserTypeEnum.THIRD
      ) {
        result.message = this.globalService.lang(
          language,
          '第三方用户不能登录系统',
          'user.thirdUser',
        );
      } else if (shop === null) {
        // 这里判断是否@店铺,是判断shop这个值是不是undefined还是null,undefined就是没有@,null就是@了店铺的
        result.message = this.globalService.lang(
          language,
          '店铺不存在',
          'user.noExistShop',
        );
      } else if (!Utils.isEmpty(expireTime)) {
        if (moment(expireTime).isBefore(moment())) {
          result.message = this.globalService.lang(
            language,
            '该用户已过期',
            'user.expireTime',
          );
        } else {
          // 计算距离过期还有多少天
          const diffDays = moment(expireTime).diff(moment(), 'days');
          if (diffDays >= 1 && diffDays <= 7) {
            expireMsg = this.globalService.lang(
              language,
              '该用户还有 {0} 天过期,请尽快联系管理员',
              'user.expireMsg',
              diffDays,
            );
          } else if (diffDays === 0) {
            expireMsg = this.globalService.lang(
              language,
              '该用户今天即将到期,请尽快联系管理员',
              'user.expireTodayMsg',
            );
          }
        }
      }
    }

    const currentDate = new Date();
    if (isUpdate) {
      if (Utils.isEmpty(result.message)) {
        // 没有错误信息,才是登录成功,才会记录登录的时间
        updateWhere.loginTime = currentDate;
      }
      await this.adminSchemaService
        .getModel()
        .updateLoginInfo(admin._id.toString(), updateWhere);
    }

    if (!Utils.isEmpty(result.message)) {
      result.code = CodeEnum.FAIL;
      return result;
    }

    // 计算权限代码
    const orgRights = otherInfo.orgRights;
    otherInfo.rights = this.getUserAllRightCodes(orgRights);

    result.code = CodeEnum.SUCCESS;
    result.expireMsg = expireMsg;
    result.currentDate = currentDate;
    return result;
  }

  async regenerateUserSession(req: RequestSession, authUser: LoginResult) {
    //登录成功写log
    //登录时用cookie做默认语言
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : '';
    const store = req.sessionStore;
    const admin: Admin = authUser.adminInfo;
    const currentDate: Date = authUser.currentDate;
    const otherInfo = authUser.otherInfo;
    //重新获取一个新的sessionID
    const getRegenerate = function (): Promise<void> {
      return new Promise((resolve) => {
        store.regenerate(req, function () {
          resolve();
        });
      });
    };
    await getRegenerate();
    const credential = 's:' + sign(req.sessionID, sessionSecret);
    req.session.adminSession = {
      adminId: admin.adminId,
      adminName: admin.adminName,
      adminType: admin.adminType,
      mobile: userAgent.indexOf('Mobile') !== -1,
      //权限这个也可以每次进来的时候查一遍,避免自己权限被别人更改,没有刷新最新的权限
      //以后会考虑压缩数据,加密后存库,使用参数控制
      //还可以避免数据库内存溢出
      encryptRights: Utils.tripleDesEncrypt(
        JSON.stringify(otherInfo.rights),
        credential,
      ), // 使用SessionID加密权限
      encryptOrgRights: Utils.tripleDesEncrypt(
        JSON.stringify(otherInfo.orgRights),
        credential,
      ),
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
      sessionId: req.sessionID,
      credential: credential,
      isFirstLogin: admin.isFirstLogin, // 如果是接口用户估计需要这个字段是false的
      // supplierCode: admin.supplierCode || '',//集团代码
      // shopName: otherInfo.shopName //店铺名,没有@shopId那么就是没有值
    };
    const resp = new RespUserLoginDto();
    resp.code = CodeEnum.SUCCESS;
    resp.credential = credential;
    resp.session = UserMapper.getTemplateSession(req.session.adminSession);
    resp.expireMsg = authUser.expireMsg;
    return resp;
  }

  async userLogout(req: RequestSession): Promise<CommonResult> {
    await this.userSessionService.deleteSession(req);
    const resp = new CommonResult();
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  getUserRoles(session: CmsSession): RespUserRolesDto {
    const resp = new RespUserRolesDto();
    resp.code = CodeEnum.SUCCESS;
    resp.roles = session.encryptRights;
    resp.orgRoles = session.encryptOrgRights;
    resp.session = UserMapper.getTemplateSession(session);
    // resp.tripleIV = this.secretConfig.get<string>('tripleIv');
    return resp;
  }

  getUserAllRightCodes(userRightCodeGroup: string[]): string[] {
    // 把权限组转换成权限代码
    const rightSet: Set<string> = new Set();
    // 用户含有默认的权限组时,把默认的权限加入rightSet
    for (const defaultGroup of RightsGroupList) {
      if (userRightCodeGroup.includes(defaultGroup.groupCode)) {
        defaultGroup.rightCodes.forEach((value) => rightSet.add(value + ''));
      }
    }
    // TODO 需要查询其他权限组的权限代码
    // 还得加上和减少用户的权限代码
    // TODO ...
    // rightSet.add('3000')
    // rightSet.add('3010')
    // rightSet.add('3011')
    // rightSet.add('30111')
    // rightSet.add('30112')
    return Array.from(rightSet);
  }
}
