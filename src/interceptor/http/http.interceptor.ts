import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
  Inject,
} from '@nestjs/common';
import { AopLogger } from '../../logger';
import { tap } from 'rxjs/operators';
import { AdminAccessService } from '../../entities';
import {
  ConfigService,
  Utils,
  RequestSession,
  CmsSession,
  UserTypeEnum,
  baseUrl,
  LogTypeEnum,
} from '../../common';

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
    const url = request.url;
    const method = request.method;
    const ip = Utils.getRequestIP(request);
    const body = request.body;
    const query = request.query;
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
        this.logger.log(`请求响应时间: ${diffTime}ms`);

        let session: CmsSession = request.session.adminSession;
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
        this.adminAccessService
          .getModel()
          .create(createParams)
          .then()
          .catch((err) => console.error(err));
      }),
    );
  }
}
