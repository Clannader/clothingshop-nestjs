export enum CodeEnum {
  SUCCESS = 100, // 成功响应时返回该响应码
  EMPTY = 101, // 校验字段为空时返回该响应码
  FAIL = 102, // 统一失败时返回该状态码
  INVALID_SESSION = 103, // session无效时返回该响应码
  NO_RIGHTS = 104, // 没有权限时返回该响应码
  EXCEPTION = 105, // 发生异常时返回该响应码
  INVALID_SYS_SETUP = 106, // 系统参数未开启时返回该响应码
  UNKNOWN = 999, // 发生未知错误时返回该响应码
}
