/**
 * 系统工具类服务
 */
export class Utils {
  /**
   * 转义32位和64位系统时的斜杠
   * @param path 需要转义的路径
   */
  static escapePath(path = ''): string {
    if (process.platform === 'win32') return path.replace(/\/+/g, '\\');
    else return path.replace(/\\+/g, '//');
  }
}
