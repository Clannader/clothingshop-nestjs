import { Request, Response } from 'express';
import { Session, Store } from 'express-session';

export interface CmsSession {
  readonly adminId: string;
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
  expires?: number;
}

export interface AdminSession {
  adminSession: CmsSession;
}

export interface RequestSession extends Request {
  session: Session & AdminSession;
  sessionID: string;
  sessionStore: Store;
  startTime?: Date;
}

export interface CmsResponse extends Response {
  returnData: string;
}

export type languageType = 'ZH' | 'EN';

export type NoInferType<T> = [T][T extends any ? 0 : never];

export type ExcludeUndefinedIf<
  ExcludeUndefined extends boolean,
  T,
> = ExcludeUndefined extends true ? Exclude<T, undefined> : T | undefined;

export type KeyOf<T> = keyof T extends never ? string : keyof T;
