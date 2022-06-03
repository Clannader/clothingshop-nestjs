/**
 * Create by CC on 2022/6/3
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestSession, sessionName, Utils } from '../common';
import * as cookieModule from 'cookie';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  use(req: RequestSession, res: Response, next: NextFunction) {
    const credential = req.headers['credential'];
    const cookie = req.headers.cookie || '';
    const cookieJSON = cookieModule.parse(cookie);
    console.log(req.cookies);
    console.log(cookie);
    console.log(cookieJSON);
    if (credential != null) {
      // delete req.cookies[sessionName]
      delete cookieJSON[sessionName];
      cookieJSON[sessionName] = credential as string;
    }
    req.headers.cookie = Utils.stringifyParams(cookieJSON, ';');
    next();
  }
}
