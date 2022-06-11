import { Request } from 'express';
import { Session, Store } from 'express-session';
import { Admin } from '@/entities';

export interface CmsSession {
  readonly adminId: string;
  readonly adminName?: string;
  readonly shopId?: string;
  readonly adminType?: string;
  readonly isFirstLogin?: boolean;
  readonly orgRights?: string[];
  readonly orgShopId?: string[];
  expires?: number;
}

export interface AdminSession {
  adminSession: CmsSession;
}

export interface RequestSession extends Request {
  session: Session & AdminSession;
  sessionID: string;
  sessionStore: Store;
}

export type NoInferType<T> = [T][T extends any ? 0 : never];

export type ExcludeUndefinedIf<
  ExcludeUndefined extends boolean,
  T,
> = ExcludeUndefined extends true ? Exclude<T, undefined> : T | undefined;

export type KeyOf<T> = keyof T extends never ? string : keyof T;

export type LoginResult = {
  message?: string;
  code: number;
  adminInfo: Admin;
};
