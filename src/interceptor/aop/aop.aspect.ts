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
    let session: CmsSession = req.session.adminSession;

    onFinished(res, () => {
      const ip = Utils.getRequestIP(req);
      const body = req.body;
      const query = req.query;
      const params = {
        ...query,
        ...body,
      };
      const diffTime = Date.now() - req.startTime.getTime();

      this.logger.log(`请求响应时间: ${diffTime}ms`);

      if (!session) {
        session = {
          adminId:
            (req.headers['adminId'] as string) || req.body['adminId'] || 'NULL',
          shopId: (req.headers['shopId'] as string) || 'SYSTEM',
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
