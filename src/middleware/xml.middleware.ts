/**
 * Create by CC on 2022/7/30
 */
import { Response, NextFunction } from 'express';
import { RequestSession } from '@/common';
import { Utils } from '@/common/utils';

export function XmlMiddleware(
  req: RequestSession,
  res: Response,
  next: NextFunction,
) {
  if (Utils.isHasSoapHeader(req)) {
    const xmlData = [];
    let xmlLen = 0;
    req.on('data', (data) => {
      xmlData.push(data);
      xmlLen += data.length;
    });
    req.on('end', () => {
      req.xmlData = Buffer.concat(xmlData, xmlLen).toString();
      next();
    });
  } else {
    next();
  }
}
