/**
 * Create by CC on 2022/6/2
 * 记录用户访问的请求日志
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ipExp } from '@/common';
import { UserTypeEnum, LogTypeEnum, RequestMethod } from '@/common/enum';

@Schema()
export class AdminAccess {
  @Prop({ required: true })
  adminId: string; // 用户的唯一ID

  @Prop({
    required: true,
    enum: [UserTypeEnum.SYSTEM, UserTypeEnum.THIRD, UserTypeEnum.OTHER],
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
  params: Record<string, any> | string; // 请求内容参数

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

/**
 * 给所有的表起一个别名,这个是获取表的别名的一个方法
 * 所以所有的表都需要加上这个同名的方法才能在插件中获得这个别名
 */
AdminAccessSchema.statics.getAliasName = function () {
  return 'AccessLog';
};

export interface AdminAccessModel extends Model<AdminAccess> {
  getAliasName(): string;
}
