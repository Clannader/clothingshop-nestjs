/**
 * Create by CC on 2022/7/20
 */

export const RightsList = {
  OtherSetup: {
    code: '3000',
    desc: '其他设置',
  },
  UserSetup: {
    code: '3300',
    desc: '用户设置',
  },
  RightsSetup: {
    code: '3400',
    desc: '权限设置',
  },
  RightsGroupSetup: {
    code: '3410',
    desc: '权限组设置',
  },
  RightsGroupCreate: {
    code: '3411',
    desc: '新建权限组',
  },
  RightsGroupModify: {
    code: '3412',
    desc: '编辑权限组',
  },
  RightsGroupDelete: {
    code: '3413',
    desc: '删除权限组',
  },
  RightsCodeSetup: {
    code: '3420',
    desc: '权限代码设置',
  },
  RightsCodeModify: {
    code: '3421',
    desc: '编辑权限代码',
  },
};

// 这里定义的枚举的值是数字,ts编译不过去,坑爹,其实也可以是字符串的
export enum RightsEnum {
  OtherSetup = +RightsList.OtherSetup.code,
  UserSetup = +RightsList.UserSetup.code,
  RightsSetup = +RightsList.RightsSetup.code,
  RightsGroupSetup = +RightsList.RightsGroupSetup.code,
  RightsGroupCreate = +RightsList.RightsGroupCreate.code,
  RightsGroupModify = +RightsList.RightsGroupModify.code,
  RightsGroupDelete = +RightsList.RightsGroupDelete.code,
  RightsCodeSetup = +RightsList.RightsCodeSetup.code,
  RightsCodeModify = +RightsList.RightsCodeModify.code,
}
