/**
 * Create by CC on 2022/7/21
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestSession } from '../types/common.types';
import { parseString } from 'xml2js';
import { Utils } from '../utils';

// @ts-ignore
const cluster = require('node:cluster');

export const UserSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    const session = request.session.adminSession;
    const workerId = cluster?.worker?.id ?? 1;
    if (!Utils.isEmpty(session)) {
      session.language = Utils.getHeadersLanguage(request);
      session.requestId = Utils.getSha1Uuid(session.sessionId); // 每次请求都赋予一个唯一的请求ID
      session.workerId = workerId;
    }
    return session;
  },
);

export const UserLanguage = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    return Utils.getHeadersLanguage(request);
  },
);

export const XmlData = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    return request.xmlData;
  },
);

export const XmlJsonData = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    const xmlData = request.xmlData;
    let xmlJson = {};
    if (!Utils.isEmpty(xmlData)) {
      parseString(xmlData, { explicitArray: false }, function (err, xmlResult) {
        if (!err) {
          xmlJson = xmlResult;
        }
      });
    }
    return xmlJson;
  },
);
