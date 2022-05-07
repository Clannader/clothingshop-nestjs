export enum CodeEnum {
  SUCCESS = 1000, // 成功响应时返回该响应码
  EMPTY = 1001, // 校验字段为空时返回该响应码
  FAIL = 1002, // 统一失败时返回该状态码
  INVALID_SESSION = 1003, // session无效时返回该响应码
  NO_RIGHTS = 1004, // 没有权限时返回该响应码
  EXCEPTION = 1005, // 发生异常时返回该响应码
  INVALID_SYS_SETUP = 1006, // 系统参数未开启时返回该响应码
  UNKNOWN = 9999, // 发生未知错误时返回该响应码
}

/**
 * 用户类型
 */
export enum UserTypeEnum {
  SYSTEM = 'SYSTEM',
  NORMAL = 'NORMAL',
  THIRD = '3RD',
}

/**
 * 排序类型
 */
export enum SortEnum {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 用户状态
 */
export enum UserStatusEnum {
  TRUE = 'T',
  FALSE = 'F',
}

/**
 * 语言类型
 */
export enum LanguageEnum {
  EN = 'EN',
  ZH = 'ZH',
}
