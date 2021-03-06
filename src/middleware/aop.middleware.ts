import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { NextFunction } from 'express';
import { CodeEnum, ConfigService, RequestSession, CmsResponse } from '@/common';
import { clean } from 'node-xss';
import { AopLogger } from '@/logger';
import { AopAspect } from '@/interceptor';

@Injectable()
export class AopMiddleware implements NestMiddleware {
  private readonly logger = new AopLogger(AopMiddleware.name);

  @Inject()
  private configService: ConfigService;

  @Inject()
  private aopAspect: AopAspect;

  use(req: RequestSession, res: CmsResponse, next: NextFunction) {
    const url = req.baseUrl;
    const method = req.method;
    // if ('GET' === method) {
    //   req.query = JSON.parse(clean(JSON.stringify(req.query)));
    // } else if ('POST' === method) {
    //   req.body = JSON.parse(clean(JSON.stringify(req.body)));
    // }
    // 这里直接放开就好了,因为post接口或者put请求时还是有可能含有query或者body值的
    req.query = JSON.parse(clean(JSON.stringify(req.query)));
    req.body = JSON.parse(clean(JSON.stringify(req.body)));
    if (this.configService.get<boolean>('printUrl', true)) {
      this.logger.log(`请求:${method} ${url}`);
    }

    req.startTime = new Date();

    const _end = res.end;
    /* eslint-disable @typescript-eslint/no-this-alias */
    const that = this;
    // @ts-ignore
    res.end = function (chunk, encoding): Response {
      this.returnData = chunk + '';
      const resultString = chunk + '';
      if (that.configService.get<boolean>('errorCatch', false)) {
        try {
          const resultJSON = JSON.parse(resultString);
          if (resultJSON.code && resultJSON.code !== CodeEnum.SUCCESS) {
            const printJSON = Object.assign({}, resultJSON, {
              path: url,
            });
            console.error(JSON.stringify(printJSON));
            resultJSON.msg = 'System Exception';
            chunk = Buffer.from(JSON.stringify(resultJSON), 'utf8');
            this.set('Content-Length', chunk.length); // 如果不设置这句话,修改chunk是没有返回的
          }
        } catch (e) {}
      }
      return _end.apply(this, [chunk, encoding]);
    };

    this.aopAspect.logAspect(req, res);
    next();
  }
}
