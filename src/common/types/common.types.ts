import { Request, Response } from 'express';
import { Session, Store } from 'express-session';
import { LanguageEnum } from '../enum';

export interface CmsSession {
  readonly adminId?: string;
  readonly adminName?: string;
  readonly shopId?: string;
  readonly adminType?: string;
  readonly isFirstLogin?: boolean;
  readonly orgRights?: string[];
  readonly orgShopId?: string[];
  readonly mobile?: boolean;
  readonly loginTime?: Date;
  readonly lastTime?: Date;
  readonly requestIP?: string;
  readonly requestHost?: string;
  readonly sessionId?: string;
  readonly credential?: string;
  language?: LanguageType;
  requestId?: string; // 请求ID
  workerId?: string; // 进程ID
  expires?: number;
}

export interface AdminSession {
  adminSession: CmsSession;
}

export interface RequestSession extends Request {
  session: Session & AdminSession;
  sessionID: string;
  // sessionStore: Store; // 发现升级后有sessionStore这个类型,后期看使用的时候对不对再说吧
  startTime?: Date;
  xmlData?: string;
}

export interface CmsResponse extends Response {
  returnData: string;
}

export type LanguageType = keyof typeof LanguageEnum;

export type NoInferType<T> = [T][T extends any ? 0 : never];

export type ExcludeUndefinedIf<
  ExcludeUndefined extends boolean,
  T,
> = ExcludeUndefined extends true ? Exclude<T, undefined> : T | undefined;

export type KeyOf<T> = keyof T extends never ? string : keyof T;

export type ErrorPromise = Error & {
  code: number;
};
