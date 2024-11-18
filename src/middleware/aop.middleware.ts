import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { NextFunction } from 'express';
import { RequestSession, CmsResponse } from '@/common';
import { CodeEnum } from '@/common/enum';
import { ConfigService } from '@/common/config';
import { clean } from 'node-xss';
import { AopLogger } from '@/logger';
import { AopAspect } from '@/interceptor/aop';
import * as crypto from 'node:crypto';
import { MemoryCacheService } from '@/cache/services';
import { CodeException } from '@/common/exceptions';

// @ts-ignore
const cluster = require('node:cluster');

@Injectable()
export class AopMiddleware implements NestMiddleware {
  private readonly logger = new AopLogger(AopMiddleware.name);

  @Inject()
  private configService: ConfigService;

  @Inject()
  private aopAspect: AopAspect;

  @Inject()
  private memoryCacheService: MemoryCacheService;

  async use(req: RequestSession, res: CmsResponse, next: NextFunction) {
    const url = req.baseUrl;
    const method = req.method;
    // if ('GET' === method) {
    //   req.query = JSON.parse(clean(JSON.stringify(req.query)));
    // } else if ('POST' === method) {
    //   req.body = JSON.parse(clean(JSON.stringify(req.body)));
    // }
    // 这里直接放开就好了,因为post接口或者put请求时还是有可能含有query或者body值的
    const securityRequest = req.headers['security-request'] === 'true';
    if (securityRequest) {
      // 这里很神奇,就算报错了,也catch不到这里的异常
      const rawBody = await this.memoryCacheService.rsaPrivateDecrypt(
        req.rawBody.toString(),
      );
      req.body = JSON.parse(rawBody);
    }
    req.query = JSON.parse(clean(JSON.stringify(req.query)));
    req.body = JSON.parse(clean(JSON.stringify(req.body)));
    if (this.configService.get<boolean>('printUrl', true)) {
      this.logger.log(
        `服务器ID: ${cluster.worker ? cluster.worker.id : 1}, ${method} 请求: ${url}`,
      );
    }

    req.startTime = new Date();
    req.requestId = crypto.randomUUID();

    const _end = res.end;
    /* eslint-disable @typescript-eslint/no-this-alias */
    const that = this;
    // @ts-ignore
    res.end = function (chunk, encoding): Response {
      // 发现这里nestjs更新后,使用swagger界面做的请求,有时候拿不到返回值,但是使用工具请求就可以,不知道是不是改过curl请求的逻辑了
      // 但是有些请求有可以拿到返回值,不知道是请求方式get的问题还是什么问题了
      // 发现确实是Get方法的问题,但是使用postman访问又没见有这种问题
      // TODO 看后面怎么解决吧
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
