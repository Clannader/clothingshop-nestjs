import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
  Inject,
} from '@nestjs/common';
import { AopLogger } from '@/logger';
import { tap } from 'rxjs/operators';
import { AdminAccessService } from '@/entities';
import {
  ConfigService,
  Utils,
  RequestSession,
  CmsSession,
  UserTypeEnum,
  baseUrl,
  LogTypeEnum,
} from '@/common';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  private readonly logger = new AopLogger(HttpInterceptor.name);

  @Inject()
  private adminAccessService: AdminAccessService;

  @Inject()
  private configService: ConfigService;

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request: RequestSession = http.getRequest();
    const now = new Date();
    const orgUrl = request.url;
    const url = orgUrl.indexOf('?') !== -1 ? orgUrl.substring(0, orgUrl.indexOf('?')) : orgUrl;
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
            .catch((err) => console.error(err));
        }
      }),
    );
  }
}
