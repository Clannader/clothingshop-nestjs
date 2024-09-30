/**
 * Create by CC on 2022/6/8
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { UpdateLoginWhere } from '@/common';
import { UserTypeEnum } from '@/common/enum';

@Schema()
export class Admin {
  @Prop({
    required: true,
    trim: true, // 去除数据前后的空格
    // uppercase:  true, // 总是将值转化为大写
  })
  adminId: string; // 登录时的管理员ID,唯一,后期考虑建唯一索引

  @Prop({
    required: true,
  })
  adminName: string; // 管理员的名字

  @Prop({
    required: true,
    enum: [UserTypeEnum.SYSTEM, UserTypeEnum.THIRD],
  })
  adminType: string; // 用户类型:SYSTEM,3RD,以后就只有系统用户和第三方用户的区分

  @Prop()
  password: string; // 管理员的密码

  @Prop({
    required: true,
  })
  shopId: string[]; // 所属的店铺ID集合或者店铺组

  @Prop({
    default: [],
  })
  rights: string[]; // 权限代码集合或者权限组

  @Prop()
  email: string; // 邮箱地址,修改逻辑可以为空,但是不能重复,并且符合邮箱格式

  @Prop({
    maxlength: 5,
  })
  usedPws: string[]; // 使用过的密码,最大长度5

  @Prop()
  loginTime: Date; // 登录时间

  @Prop({
    default: false,
  })
  adminStatus: boolean; // 用户状态,false时不可登录

  @Prop()
  createUser: string; // 创建这个用户的人

  @Prop()
  createDate: Date; // 创建时间

  @Prop()
  modifyDate: Date; // 上一次修改的时间

  @Prop({
    default: 0,
  })
  retryNumber: number; // 密码错误次数

  @Prop()
  lockTime: Date; // 用户被锁定时间

  @Prop()
  expireTime: Date; // 用户有效期

  @Prop({
    default: true,
  })
  isFirstLogin: boolean; // 新增用户默认true,设置用户密码时变成true,判断用户是否是第一次登录
  // 则需要修改密码
}

export type AdminDocument = HydratedDocument<Admin>;

export const AdminSchema = SchemaFactory.createForClass(Admin);

/**
 * 给所有的表起一个别名,这个是获取表的别名的一个方法
 * 所以所有的表都需要加上这个同名的方法才能在插件中获得这个别名
 */
AdminSchema.statics.getAliasName = function () {
  return 'CmsUser';
};

AdminSchema.statics.updateLoginInfo = function (
  id: string,
  update: UpdateLoginWhere,
) {
  return this.updateOne({ _id: id }, { $set: update });
};

// AdminSchema.virtual('id').get(function() {
//   return this._id.toString()
// })

export interface AdminModel extends Model<Admin> {
  getAliasName(): string;
  updateLoginInfo(id: string, update: UpdateLoginWhere): any;
}
