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

  @Prop()
  adminName: string; // 操作员名字

  @Prop({
    default: new Date(),
  })
  date: Date; // 操作时间

  @Prop({
    required: true,
  })
  content: string; // 操作内容

  @Prop()
  shopId: string; // 操作的店铺ID

  @Prop({
    enum: Utils.enumToArray(LogTypeEnum)[1],
  })
  type: string; // 操作类型

  @Prop()
  serverName: string; // 服务器名,例如app1, app2

  @Prop()
  processId: string; // 进程ID
}

export type AdminLogDocument = HydratedDocument<AdminLog>;

export const AdminLogSchema = SchemaFactory.createForClass(AdminLog);

AdminLogSchema.statics.getAliasName = function () {
  return 'UserLog';
};

export interface AdminLogModel extends Model<AdminLog> {
  getAliasName(): string;
}
