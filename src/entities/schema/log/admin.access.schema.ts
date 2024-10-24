/**
 * Create by CC on 2022/6/2
 * 记录用户访问的请求日志
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ipExp } from '@/common';
import { UserTypeEnum, LogTypeEnum, RequestMethod } from '@/common/enum';
import { Utils } from '@/common/utils';

@Schema()
export class AdminAccess {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  adminId: string; // 用户的唯一ID

  @Prop({
    type: String,
    required: true,
    enum: Utils.enumToArray(UserTypeEnum)[1],
  })
  adminType: string; // 用户类型

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  shopId: string; // 操作的店铺ID

  @Prop({
    type: Date,
    required: true,
  })
  date: Date; // 访问时间

  @Prop({
    type: String,
    required: true,
    match: ipExp,
  })
  ip: string; // ip地址

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  url: string; // 请求地址

  @Prop({
    type: Object, // TODO 以后思考如何自定义一种Json的key value类型作为数据库类型
    required: true,
    default: {},
  })
  params: Record<string, any> | string; // 请求内容参数

  @Prop({
    type: String,
    required: true,
    enum: Utils.enumToArray(LogTypeEnum)[1],
  })
  type: string; // 请求类型

  @Prop({
    type: String,
    required: true,
    enum: Utils.enumToArray(RequestMethod)[1],
  })
  method: string; // 请求方式

  @Prop({
    type: Number,
    required: true,
  })
  timestamp: number; // 请求时间

  @Prop({
    type: Object,
    required: true,
  })
  send: Record<string, any> | string; // 请求返回内容

  @Prop({
    type: Object,
    required: true,
    // alias: '字段别名'
  })
  headers: Record<string, any>; // 请求头内容

  @Prop({
    type: String,
    required: true,
  })
  serverName: string; // 服务器名,通过config.ini配置

  @Prop({
    type: String,
    required: true,
    default: '1',
  })
  workerId: string; // 服务器的进程ID号,只有启动多进程时才会有多个,否则默认都是1
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
