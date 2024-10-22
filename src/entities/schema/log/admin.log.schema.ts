/**
 * Create by oliver.wu 2024/10/9
 * 记录用户的操作日志
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { LogTypeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

@Schema()
export class AdminLog {
  @Prop({
    required: true,
    trim: true,
  })
  adminId: string; // 操作员ID

  @Prop({
    required: true,
    trim: true,
  })
  adminName: string; // 操作员名字

  @Prop({
    required: true,
  })
  date?: Date; // 操作时间

  @Prop({
    required: true,
    trim: true,
  })
  content: string; // 操作内容

  @Prop({
    required: true,
    trim: true,
  })
  shopId: string; // 操作的店铺ID

  @Prop({
    required: true,
    enum: Utils.enumToArray(LogTypeEnum)[1],
  })
  type: string; // 操作类型

  @Prop({
    required: true,
    trim: true,
  })
  serverName?: string; // 服务器名,例如app1, app2

  @Prop({
    required: true,
    trim: true,
  })
  workerId?: string; // 进程ID

  @Prop({
    required: true,
    trim: true,
  })
  traceId: string; // 日志追踪ID

  @Prop({
    // 这样写类型才是有效的,并且如果传入string,会自动转成数组存储
    // 如果写成type: Array无效,如果传入string,则会以string的类型存到数据库中
    type: [String],
  })
  linkId?: string[]; // 关联其他表的_id
}

export type AdminLogDocument = HydratedDocument<AdminLog>;

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog);

AdminLogSchema.statics.getAliasName = function () {
  return 'UserLog';
};

export interface AdminLogModel extends Model<AdminLog> {
  getAliasName(): string;
}
