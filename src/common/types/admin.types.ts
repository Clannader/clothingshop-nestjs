import type { AdminDocument } from '@/entities/schema';
import type { ErrorPromise } from './common.types';

export type UpdateLoginWhere = {
  retryNumber?: number;
  lockTime?: Date;
  loginTime?: Date;
};

export type LoginResult = ErrorPromise & {
  expireMsg?: string;
  currentDate?: Date;
  adminInfo?: AdminDocument;
  shopInfo?: object | string; //TODO 暂时这样定义,后期改
  otherInfo?: {
    rights: string[];
    shopList: string[];
    currentShop: string;
  };
};
