/**
 * Create by CC on 2022/7/19
 */
import { Response } from 'express';
import {
  baseUrl,
  CmsSession,
  CodeEnum,
  ConfigService,
  GlobalService,
  LogTypeEnum,
  RequestSession,
  UserTypeEnum,
} from '@/common';
import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '@/user';
import {
  CodeEnum,
  GlobalService,
  Utils,
  Session_Expires,
  RequestSession,
  logoutUrl,
} from '@/common';
import { tap } from 'rxjs/operators';
@Injectable()
export class AopAspect {
  @Inject()
  private globalService: GlobalService;

  @Inject()
  private userService: UserService;
  async logAspect(req: RequestSession, res: Response): void {
    const http = context.switchToHttp();
    const request: RequestSession = http.getRequest();
    const now = new Date();
    const orgUrl = request.url;
    const url =
      orgUrl.indexOf('?') !== -1
        ? orgUrl.substring(0, orgUrl.indexOf('?'))
        : orgUrl;
    const method = request.method;
    const ip = Utils.getRequestIP(request);
    const body = request.body;
    const query = request.query;
    let session: CmsSession = request.session.adminSession;
    const params = {
      ...query,
      ...body,
    };

    if (this.configService.get<boolean>('printUrl', true)) {
      this.logger.log(`请求:${request.method} ${request.url}`);
    }

    return next.handle().pipe(
      tap((value) => {
        const diffTime = Date.now() - now.getTime();
        // this.logger.log(`请求响应时间: ${diffTime}ms`);
        if (!session) {
          session = {
            adminId:
              (request.headers['adminid'] as string) ||
              request.body['adminId'] ||
              'NULL',
            shopId: (request.headers['shopid'] as string) || 'SYSTEM',
            adminType: UserTypeEnum.OTHER,
          };
        }
        const isIndex = url.indexOf(baseUrl) !== -1; //如果url含有index,说明是网页进来的
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
          send: value,
          headers: Object.assign(request.headers, {
            cookie: request.cookies,
          }),
        };
        if (this.configService.get<boolean>('monitorLog', true)) {
          this.adminAccessService
            .getModel()
            .create(createParams)
            .then()
            .catch((err) => this.logger.error(err));
        }
      }),
    );
  }
}
