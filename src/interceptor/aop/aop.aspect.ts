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
import httpFinished from 'on-finished';
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
    const orgUrl = req.url;
    const url =
      orgUrl.indexOf('?') !== -1
        ? orgUrl.substring(0, orgUrl.indexOf('?'))
        : orgUrl;
    console.log(req.baseUrl);
    console.log(req.url);
    console.log(req.originalUrl);
    console.log(url);
    const method = req.method;

    if (method === 'OPTIONS') {
      return;
    }

    const ip = Utils.getRequestIP(req);
    const body = req.body;
    const query = req.query;
    let session: CmsSession = req.session.adminSession;
    const params = {
      ...query,
      ...body,
    };

    httpFinished(res, () => {
      const diffTime = Date.now() - now.getTime();
      // this.logger.log(`请求响应时间: ${diffTime}ms`);
      if (!session) {
        session = {
          adminId:
            (req.headers['adminid'] as string) || req.body['adminId'] || 'NULL',
          shopId: (req.headers['shopid'] as string) || 'SYSTEM',
          adminType: UserTypeEnum.OTHER,
        };
      }
      const isIndex = url.indexOf(baseUrl) !== -1; //如果url含有index,说明是网页进来的
      let returnData = res.returnData;
      try {
        returnData = JSON.parse(res.returnData);
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
