import { Request, Response } from 'express';
import { Session } from 'express-session';
import { LanguageEnum } from '../enum';
import { LoginResult } from '@/common'; // 依赖互相引用了,似乎没什么问题

export interface CmsSession {
  readonly adminId?: string;
  readonly adminName?: string;
  readonly shopId?: string;
  readonly adminType?: string;
  readonly isFirstLogin?: boolean;
  readonly orgShopId?: string[];
  readonly mobile?: boolean;
  readonly loginTime?: Date;
  readonly lastTime?: Date;
  readonly requestIP?: string;
  readonly requestHost?: string;
  readonly sessionId?: string;
  readonly credential?: string;
  readonly encryptRights?: string;
  readonly encryptOrgRights?: string;
  rights?: string[]; // 该值计划不存在数据库中
  orgRights?: string[]; // 该值计划不存在数据库中
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
  rawBody?: Buffer;
  requestId?: string;
  user?: LoginResult;
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

export type SecurityOptions = {
  securityToken?: string;
  securityId?: string;
};

export type IgnoreCaseType = {
  $regex: string;
  $options: string;
};
