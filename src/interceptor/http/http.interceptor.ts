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
import { ConfigService, Utils } from '../../common';
import { Request } from 'express';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  private readonly logger = new AopLogger(HttpInterceptor.name);

  @Inject()
  private adminAccessService: AdminAccessService;

  @Inject()
  private configService: ConfigService;

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request: Request = http.getRequest();
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

    const createParams = {
      date: now,
      ip,
      url,
      method: method.toUpperCase(),
      params,
      shopId: 'SYSTEM',
      adminId: '01',
      adminType: 'SYSTEM',
      type: 'Interface',
      timestamp: 120,
      send: {},
      headers: Object.assign(request.headers, {
        cookie: request.cookies,
      }),
    };
    // this.adminAccessService.getModel().create(createParams);
    this.adminAccessService
      .getModel()
      .find({ adminId: '01' }, { ip: 1 }, (err, result) => {
        // console.log(result)
      });
    this.adminAccessService
      .getModel()
      .findOne({ adminId: '01' }, { adminId: 1 }, (err, result) => {
        // console.log(result)
      });
    return next.handle().pipe(
      tap(() => {
        // 测试发现这个拦截器是在执行业务之后,返回客户端时拦截的,而不是在请求前拦截的
        this.logger.log(`请求后:响应时间 ${Date.now() - now.getTime()}ms`);
      }),
    );
  }
}
