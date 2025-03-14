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
    // 计算好的权限值
    rights: string[];
    // 数据库原本的权限值
    orgRights: string[];
    shopList: string[];
    currentShop: string;
  };
  errorMsg?: {
    code: number;
    message: string;
  };
};
