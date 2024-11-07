import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { AopLogger } from '@/logger';
import {
  CommonResult,
  RequestSession,
  CmsSession,
  UpdateLoginWhere,
  LoginResult,
  SECRET_CONFIG,
  LanguageType,
} from '@/common';
import { CodeEnum, UserTypeEnum } from '@/common/enum';
import { ConfigService } from '@/common/config';
import { GlobalService, Utils } from '@/common/utils';
import {
  ReqUserLoginDto,
  ReqUserSearchDto,
  RespUserSearchDto,
  RespUserRolesDto,
} from './dto';
import { AdminSchemaService } from '@/entities/services';
import { AdminDocument } from '@/entities/schema';
import { UserSessionService } from './user.session.service';
import { UserMapper } from './user.mapper';

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

  async getUsersList(params: ReqUserSearchDto): Promise<RespUserSearchDto> {
    this.logger.log(params);
    const resp = new RespUserSearchDto();
    resp.code = 100;
    return resp;
  }

  async userLogin(
    language: LanguageType,
    params: ReqUserLoginDto,
    securityToken: string,
  ): Promise<LoginResult> {
    const adminId = params.adminId;
    const password = params.adminPws; // 新增密码需要客户端加密后传回来
    if (Utils.isEmpty(securityToken)) {
      return Promise.resolve(<LoginResult>{
        message: this.globalService.lang(
          language,
          '安全Token不能为空',
          'user.securityTokenIsEmpty',
        ),
        code: CodeEnum.FAIL,
      });
    }
    const [err, result] = await Utils.toPromise(
      this.adminSchemaService.loginSystem(language, adminId),
    );
    if (err) {
      return err;
    }

    const admin: AdminDocument = result.adminInfo;
    const shop = result.shopInfo; // 以后如果@店铺进来的话,这个shopInfo就是@的店铺信息
    // const otherInfo = result.otherInfo; // 这个其他信息就是展开权限和展开店铺组的其他额外计算信息
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

    if (admin.password !== password) {
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

    result.code = CodeEnum.SUCCESS;
    result.expireMsg = expireMsg;
    result.currentDate = currentDate;
    return result;
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
    resp.roles = Utils.tripleDesEncryptBySession(
      Utils.stringToBase64('3000,3400,3410,3420'),
      session,
      this.secretConfig.get<string>('tripleIv'),
    );
    resp.session = UserMapper.getTemplateSession(session);
    resp.tripleIV = this.secretConfig.get<string>('tripleIv');
    return resp;
  }
}
