/**
 * Create by CC on 2022/6/2
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import {
  UserTypeEnum,
  ipExp,
  LogTypeEnum,
  RequestMethod,
} from '../../../common';

@Schema()
export class AdminAccess extends Document {
  @Prop({ required: true })
  adminId: string; // 用户的唯一ID

  @Prop({
    required: true,
    enum: [UserTypeEnum.SYSTEM, UserTypeEnum.THIRD],
  })
  adminType: string; // 用户类型

  @Prop({
    required: true,
  })
  shopId: string; // 操作的店铺ID

  @Prop({
    required: true,
  })
  date: Date; // 访问时间

  @Prop({
    required: true,
    match: ipExp,
  })
  ip: string; // ip地址

  @Prop({
    required: true,
  })
  url: string; // 请求地址

  @Prop({
    required: true,
    type: Object,
    default: {},
  })
  params: Record<string, any>; // 请求内容参数

  @Prop({
    required: true,
    enum: [
      LogTypeEnum.Right,
      LogTypeEnum.Config,
      LogTypeEnum.Browser,
      LogTypeEnum.Interface,
      LogTypeEnum.ServerLog,
      LogTypeEnum.User,
    ],
  })
  type: string; // 请求类型

  @Prop({
    required: true,
    enum: [
      RequestMethod.GET,
      RequestMethod.POST,
      RequestMethod.PUT,
      RequestMethod.DELETE,
      RequestMethod.PATCH,
      RequestMethod.OPTIONS,
    ],
  })
  method: string; // 请求方式

  @Prop({
    required: true,
  })
  timestamp: number; // 请求时间

  @Prop({
    required: true,
    type: Object,
  })
  send: Record<string, any> | string; // 请求返回内容

  @Prop({
    required: true,
    type: Object,
    // alias: '字段别名'
  })
  headers: Record<string, any>; // 请求头内容
}

export const AdminAccessSchema = SchemaFactory.createForClass(AdminAccess);

export type AdminAccessModel = Model<AdminAccess>;
