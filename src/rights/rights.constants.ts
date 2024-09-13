/**
 * Create by CC on 2022/7/20
 * 权限规则,一般4位数,首位是功能序号,中间是子功能序号,最后是子功能后的细节权限
 * 如果超过2位,考虑使用字母或者使用2位数,例如 10 01 01 => 100101
 */

type RightsConfig = {
  [key: string]: {
    code: string;
    desc: string;
    children?: RightsConfig;
  };
};

export const RightsList: RightsConfig = {
  OtherSetup: {
    code: '3000',
    desc: '其他设置',
  },
  SystemDataSetup: {
    code: '3010',
    desc: '系统数据设置',
  },
  UserSetup: {
    code: '3020',
    desc: '用户管理',
  },
  RightsSetup: {
    code: '3030',
    desc: '权限设置',
    children: {
      RightsGroupSetup: {
        code: '30310',
        desc: '权限组设置',
        children: {
          RightsGroupCreate: {
            code: '30311',
            desc: '新建权限组',
          },
          RightsGroupModify: {
            code: '30312',
            desc: '编辑权限组',
          },
          RightsGroupDelete: {
            code: '30313',
            desc: '删除权限组',
          },
        },
      },
      RightsCodeSetup: {
        code: '30320',
        desc: '权限代码设置',
        children: {
          RightsCodeModify: {
            code: '30321',
            desc: '编辑权限代码',
          },
        },
      },
    },
  },
  RepairData: {
    code: '3040',
    desc: '修复系统数据'
  }
};

// 这里定义的枚举的值是数字,ts编译不过去,坑爹,其实也可以是字符串的
export enum RightsEnum {
  OtherSetup = +RightsList.OtherSetup.code,
  SystemDataSetup = +RightsList.SystemDataSetup.code,
  UserSetup = +RightsList.UserSetup.code,
  RightsSetup = +RightsList.RightsSetup.code,
  RightsGroupSetup = +RightsList.RightsSetup.children.RightsGroupSetup.code,
  RightsGroupCreate = +RightsList.RightsSetup.children.RightsGroupSetup.children.RightsGroupCreate.code,
  RightsGroupModify = +RightsList.RightsSetup.children.RightsGroupSetup.children.RightsGroupModify.code,
  RightsGroupDelete = +RightsList.RightsSetup.children.RightsGroupSetup.children.RightsGroupDelete.code,
  RightsCodeSetup = +RightsList.RightsSetup.children.RightsCodeSetup.code,
  RightsCodeModify = +RightsList.RightsSetup.children.RightsCodeSetup.children.RightsCodeModify.code,
  RepairData = +RightsList.RepairData.code,
}
