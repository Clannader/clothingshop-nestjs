import { Admin } from '@/entities/schema';

export type UpdateLoginWhere = {
  retryNumber?: number;
  lockTime?: Date;
  loginTime?: Date;
};

export type LoginResult = {
  message?: string;
  expireMsg?: string;
  currentDate?: Date;
  code: number;
  adminInfo: Admin;
  shopInfo: object | string; //TODO 暂时这样定义,后期改
  otherInfo: {
    rights: string[];
    shopList: string[];
    currentShop: string;
  };
};
