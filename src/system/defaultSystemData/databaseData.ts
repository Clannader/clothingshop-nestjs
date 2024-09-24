/**
 * Create by oliver.wu 2024/9/24
 */

export type IndexOptions = {
  unique?: boolean;
  expireAfterSeconds?: number;
  name?: string;
};

export type IndexSchema = {
  aliasName: string;
  fields: Record<string, any>;
  options?: IndexOptions;
};

// 默认索引
export const defaultIndexes: IndexSchema[] = [
  {
    aliasName: 'CmsUser',
    fields: {
      email: 1,
    },
    options: {
      unique: true, // 唯一索引
    },
  },
  {
    aliasName: 'CmsUser',
    fields: {
      adminId: 1,
      adminType: 1,
    },
    options: {
      unique: true, // 唯一索引
    },
  },
  {
    aliasName: 'CmsUser',
    fields: {
      adminId: 1,
      adminName: 1, // 按用户ID和用户名查询
    },
  },
  {
    aliasName: 'CmsUser',
    fields: {
      rights: 1, // 按权限代码查询
    },
  },
  {
    aliasName: 'AccessLog',
    fields: {
      date: 1,
    },
    options: {
      name: 'expireClear',
      expireAfterSeconds: 15 * 24 * 60 * 60, // 保留15天
    },
  },
  {
    aliasName: 'CmsRightCode',
    fields: {
      code: 1,
    },
    options: {
      unique: true,
    },
  },
  {
    aliasName: 'CmsRightCodeGroup',
    fields: {
      groupCode: 1,
    },
    options: {
      unique: true,
    },
  },
];
