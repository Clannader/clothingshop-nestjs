import { Admin } from '@/entities';

export type LoginResult = {
  message?: string;
  code: number;
  adminInfo: Admin;
  shopInfo: object; // 暂时这样定义,后期改
};

export type UpdateLoginWhere = {
  retryNumber?: number;
  lockTime?: Date;
  loginTime?: Date;
};
