export enum CodeEnum {
  NO_FOUND = 404, // 地址不存在
  SUCCESS = 1000, // 成功响应时返回该响应码
  EMPTY = 1001, // 校验字段为空时返回该响应码
  FAIL = 1002, // 统一失败时返回该状态码
  INVALID_SESSION = 1003, // session无效时返回该响应码
  NO_RIGHTS = 1004, // 没有权限时返回该响应码
  EXCEPTION = 1005, // 发生异常时返回该响应码
  INVALID_SYS_SETUP = 1006, // 系统参数未开启时返回该响应码
  INVALID_HEADERS = 1007, // 请求头错误时返回该响应码
  SESSION_EXPIRED = 1008, // 凭证过期返回该响应码
  FIRST_LOGIN = 1009, // 第一次登录需要修改密码
  UNKNOWN = 9999, // 发生未知错误时返回该响应码
}

/**
 * 用户类型
 */
export enum UserTypeEnum {
  SYSTEM = 'SYSTEM',
  // NORMAL = 'NORMAL',
  THIRD = '3RD',
  OTHER = 'OTHER', // 针对没有登录时的用户记录行为时的类型
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

/**
 * 日志类型
 */
export enum LogTypeEnum {
  Right = 'Right',
  Config = 'Config',
  Browser = 'Browser',
  Interface = 'Interface',
  ServerLog = 'ServerLog',
  User = 'User',
}

/**
 * 请求类型
 */
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
}
