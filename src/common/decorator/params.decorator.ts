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
    // 这里不需要使用Utils.isEmpty判空,因为当时是没有加上@UseGuards(SessionGuard)导致没有session
    // if (!Utils.isEmpty(session)) {
    session.language = Utils.getHeadersLanguage(request);
    // 这里发现一个问题,那就是如果不使用@UserSession时,如果上一个接口赋值了,下一个接口没使用@UserSession,那么下一个接口的requestId是没有变化的
    // 如果想每个请求都生成一个新的ID,那么在aop.middleware中的req生成即可
    session.requestId = Utils.getSha1Uuid(session.sessionId, 32); // 每次请求都赋予一个唯一的请求ID
    session.workerId = workerId;
    session.rights = JSON.parse(
      Utils.tripleDesDecrypt(session.encryptRights, session.credential),
    );
    session.orgRights = JSON.parse(
      Utils.tripleDesDecrypt(session.encryptOrgRights, session.credential),
    );
    // }
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
