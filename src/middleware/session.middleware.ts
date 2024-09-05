/**
 * Create by CC on 2022/6/3
 */
import { Response, NextFunction } from 'express';
import { RequestSession, sessionName } from '@/common';
import { Utils } from '@/common/utils';
import * as cookieModule from 'cookie';

export function SessionMiddleware(
  req: RequestSession,
  res: Response,
  next: NextFunction,
) {
  const credential = req.headers['credential'];
  const cookie = req.headers.cookie || ''; // 这个是原始的cookie取值
  const cookieJSON = cookieModule.parse(cookie); // 原始的cookie是字符串,格式化变成JSON
  // console.log(req.cookies); // 需要使用cookie-parser包才能有这个节点,并且是JSON格式的
  if (credential != null) {
    delete req.cookies[sessionName];
    delete cookieJSON[sessionName];
    cookieJSON[sessionName] = credential as string;
    req.headers.cookie = Utils.stringifyParams(cookieJSON, ';');
  }
  next();
}
