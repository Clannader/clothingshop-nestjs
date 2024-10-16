/**
 * Create by CC on 2022/7/21
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestSession } from '../types/common.types';
import { parseString } from 'xml2js';
import { Utils } from '../utils';

export const UserSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    const session = request.session.adminSession;
    session.language = Utils.getHeadersLanguage(request);
    return session;
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
