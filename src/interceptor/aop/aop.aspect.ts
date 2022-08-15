/**
 * Create by CC on 2022/7/19
 */
import {
  baseUrl,
  CmsSession,
  ConfigService,
  LogTypeEnum,
  UserTypeEnum,
  Utils,
  RequestSession,
  CmsResponse,
} from '@/common';
import { Injectable, Inject } from '@nestjs/common';
import { AopLogger } from '@/logger';
import * as onFinished from 'on-finished';
import { AdminAccessService } from '@/entities';

@Injectable()
export class AopAspect {
  private readonly logger = new AopLogger(AopAspect.name);

  @Inject()
  private configService: ConfigService;

  @Inject()
  private adminAccessService: AdminAccessService;

  logAspect(req: RequestSession, res: CmsResponse): void {
    const now = new Date();
    const url = req.baseUrl;
    const method = req.method;

    if (method === 'OPTIONS') {
      return;
    }

    // 如果是没有session的,在onFinished里面取是直接报错的
    let session: CmsSession = req.session && req.session.adminSession;

    // 这里还要考虑jwt过来的时候,带入的session值解析,记录用户操作
    // 考虑做法,在jwt守卫那边解析出来值,放到req里面,然后完成响应的时候,只要判断节点里面有值,就替换session
    // 即可,这样就认为是jwt过来的session,代码里面的session直接相当参数往后传即可

    onFinished(res, () => {
      const ip = Utils.getRequestIP(req);
      const body = req.body;
      const query = req.query;
      let params = {
        ...query,
        ...body,
      };
      // 由于涉及到上传文件内容时数据过大,需要脱敏进数据库
      const piiFields = ['adminPws', 'fileContent', 'refreshToken', 'accessToken'];
      piiFields.forEach((field) => {
        if (params.hasOwnProperty(field) && typeof params[field] === 'string') {
          params[field] = Utils.piiData(params[field]);
        }
      });
      if (Utils.isHasSoapHeader(req)) {
        params = req.xmlData;
      }
      const diffTime = Date.now() - req.startTime.getTime();

      this.logger.log(`请求响应时间: ${url} ${diffTime}ms`);

      if (!session) {
        session = {
          adminId:
            (req.headers['adminId'] as string) || req.body['adminId'] || 'NULL',
          shopId:
            (req.headers['shopId'] as string) || req.body['shopId'] || 'NULL',
          adminType: UserTypeEnum.OTHER,
        };
      }
      const isIndex = url.indexOf(baseUrl) !== -1; //如果url含有index,说明是网页进来的
      let returnData = res.returnData;
      try {
        returnData = JSON.parse(res.returnData);
        piiFields.forEach((field) => {
          if (returnData.hasOwnProperty(field) && typeof returnData[field] === 'string') {
            returnData[field] = Utils.piiData(returnData[field]);
          }
        });
      } catch (e) {}
      const createParams = {
        date: now,
        ip,
        url,
        method: method.toUpperCase(),
        params,
        shopId: session.shopId,
        adminId: session.adminId,
        adminType: session.adminType,
        type: isIndex ? LogTypeEnum.Browser : LogTypeEnum.Interface,
        timestamp: diffTime,
        send: returnData,
        headers: Object.assign(req.headers, {
          cookie: req.cookies,
        }),
      };
      if (this.configService.get<boolean>('monitorLog', true)) {
        this.adminAccessService
          .getModel()
          .create(createParams)
          .then()
          .catch((err) => this.logger.error(err));
      }
    });
  }
}
