/**
 * Create by CC on 2022/7/21
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestSession } from '../common.types';
import { parseString } from 'xml2js';
import { Utils } from '../utils';

export const UserSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    return request.session.adminSession;
  },
);

export const XmlData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    return request.xmlData;
  },
);

export const XmlJsonData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
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
