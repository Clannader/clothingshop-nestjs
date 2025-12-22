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
  indexName?: string;
  indexStatus?: number;
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
  {
    aliasName: 'CmsSequence',
    fields: {
      shopId: 1,
      type: 1,
    },
    options: {
      unique: true,
    },
  },
  {
    aliasName: 'SystemData',
    fields: {
      type: 1,
    },
  },
  {
    aliasName: 'SystemData',
    fields: {
      timeZone: 1,
    },
    options: {
      unique: true,
    },
  },
  {
    aliasName: 'DeleteRecord',
    fields: {
      deleteDate: 1,
    },
    options: {
      name: 'expireClear',
      expireAfterSeconds: 15 * 24 * 60 * 60, // 保留15天
    },
  },
  {
    aliasName: 'UserLog',
    fields: {
      date: 1,
    },
    options: {
      name: 'expireClear',
      expireAfterSeconds: 15 * 24 * 60 * 60, // 保留15天
    },
  },
  {
    aliasName: 'UserLog',
    fields: {
      traceId: 1, // 用户日志按traceId查询
    },
  },
  {
    aliasName: 'UserLog',
    fields: {
      linkId: 1, // 用户日志按linkId查询
    },
  },
  {
    aliasName: 'StatisticsUrlCount',
    fields: {
      date: 1,
    },
    options: {
      name: 'expireClear',
      expireAfterSeconds: 7 * 24 * 60 * 60, // 保留7天
    },
  },
];

export type TimeZoneSchema = {
  timeZone: string;
  winter: string; // 冬令时
  summer: string; // 夏令时
};

// 默认时区设置
export const defaultTimeZone: TimeZoneSchema[] = [
  {
    timeZone: 'America/Scoresbysund',
    summer: '+00:00',
    winter: '-01:00',
  },
  {
    timeZone: 'Europe/London',
    summer: '+01:00', // 夏令时
    winter: '+00:00', // 冬令时
  },
  {
    timeZone: 'Europe/Andorra',
    summer: '+02:00',
    winter: '+01:00',
  },
  {
    timeZone: 'Europe/Helsinki',
    summer: '+03:00',
    winter: '+02:00',
  },
  {
    timeZone: 'Europe/Minsk',
    summer: '+03:00',
    winter: '+03:00',
  },
  {
    timeZone: 'Europe/Astrakhan',
    summer: '+04:00',
    winter: '+04:00',
  },
  {
    timeZone: 'Asia/Tehran',
    summer: '+04:30',
    winter: '+03:30',
  },
  {
    timeZone: 'Asia/Kabul',
    summer: '+04:30',
    winter: '+04:30',
  },
  {
    timeZone: 'Asia/Karachi',
    summer: '+05:00',
    winter: '+05:00',
  },
  {
    timeZone: 'Asia/Colombo',
    summer: '+05:30',
    winter: '+05:30',
  },
  {
    timeZone: 'Asia/Kathmandu',
    summer: '+05:45',
    winter: '+05:45',
  },
  {
    timeZone: 'Asia/Dhaka',
    summer: '+06:00',
    winter: '+06:00',
  },
  {
    timeZone: 'Asia/Yangon',
    summer: '+06:30',
    winter: '+06:30',
  },
  {
    timeZone: 'Asia/Tomsk',
    summer: '+07:00',
    winter: '+07:00',
  },
  {
    timeZone: 'Asia/Shanghai',
    summer: '+08:00',
    winter: '+08:00',
  },
  {
    timeZone: 'Australia/Perth',
    summer: '+08:00',
    winter: '+08:00',
  },
  {
    timeZone: 'Australia/Eucla',
    summer: '+08:45',
    winter: '+08:45',
  },
  {
    timeZone: 'Asia/Jayapura',
    summer: '+09:00',
    winter: '+09:00',
  },
  {
    timeZone: 'Australia/Darwin',
    summer: '+09:30',
    winter: '+09:30',
  },
  {
    timeZone: 'Australia/Brisbane',
    summer: '+10:00',
    winter: '+10:00',
  },
  {
    timeZone: 'Australia/Broken_Hill',
    summer: '+10:30',
    winter: '+9:30',
  },
  {
    timeZone: 'Australia/Adelaide',
    summer: '+10:30',
    winter: '+9:30',
  },
  {
    timeZone: 'Australia/Melbourne',
    summer: '+11:00',
    winter: '+10:00',
  },
  {
    timeZone: 'Australia/Sydney',
    summer: '+11:00',
    winter: '+10:00',
  },
  {
    timeZone: 'Pacific/Pohnpei',
    summer: '+11:00',
    winter: '+11:00',
  },
  {
    timeZone: 'Pacific/Fiji',
    summer: '+12:00',
    winter: '+12:00',
  },
  {
    timeZone: 'Pacific/Auckland',
    summer: '+13:00',
    winter: '+12:00',
  },
  {
    timeZone: 'Pacific/Fakaofo',
    summer: '+13:00',
    winter: '+13:00',
  },
  {
    timeZone: 'Pacific/Chatham',
    summer: '+13:45',
    winter: '+12:45',
  },
  {
    timeZone: 'America/Noronha',
    summer: '-02:00',
    winter: '-02:00',
  },
  {
    timeZone: 'America/St_Johns',
    summer: '-02:30',
    winter: '-03:30',
  },
  {
    timeZone: 'America/Araguaina',
    summer: '-03:00',
    winter: '-03:00',
  },
  {
    timeZone: 'America/Halifax',
    summer: '-03:00',
    winter: '-04:00',
  },
  {
    timeZone: 'America/Toronto',
    summer: '-04:00',
    winter: '-05:00',
  },
  {
    timeZone: 'America/Winnipeg',
    summer: '-05:00',
    winter: '-06:00',
  },
  {
    timeZone: 'America/Edmonton',
    summer: '-06:00',
    winter: '-07:00',
  },
  {
    timeZone: 'America/Los_Angeles',
    summer: '-07:00',
    winter: '-08:00',
  },
  {
    timeZone: 'America/Anchorage',
    summer: '-08:00',
    winter: '-09:00',
  },
  {
    timeZone: 'America/Adak',
    summer: '-09:00',
    winter: '-10:00',
  },
  {
    timeZone: 'Pacific/Marquesas',
    summer: '-09:30',
    winter: '-09:30',
  },
  {
    timeZone: 'Pacific/Tahiti',
    summer: '-10:00',
    winter: '-10:00',
  },
  {
    timeZone: 'Pacific/Niue',
    summer: '-11:00',
    winter: '-11:00',
  },
];
