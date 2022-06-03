import * as CryptoJS from 'crypto-js';
import { tripleDES, ipExp } from '../constants';
import { get, isPlainObject, has, forEach } from 'lodash';
import { Request } from 'express';
import * as os from 'os';

/**
 * 系统工具类
 */
export class Utils {
  /**
   * 转义32位和64位系统时的斜杠
   * @param path 需要转义的路径
   */
  static escapePath(path: string): string {
    if (process.platform === 'win32') return path.replace(/\/+/g, '\\');
    else return path.replace(/\\+/g, '//');
  }

  /**
   * 转义特殊字符
   * @param str 需要转义的字符串
   */
  static escapeString(str: string): string {
    return str.replace(/([.*+?^=!${}()|\[\]\/\\])/g, '\\$1');
  }

  static md5(str: string): string {
    return CryptoJS.MD5(str).toString();
  }

  static sha256(str: string, key?: string) {
    if (key) {
      return CryptoJS.HmacSHA256(str, key).toString();
    }
    return CryptoJS.SHA256(str).toString();
  }

  static sha1(str: string, key?: string) {
    if (key) {
      return CryptoJS.HmacSHA1(str, key).toString();
    }
    return CryptoJS.SHA1(str).toString();
  }

  /**
   * 3DES加密算法
   * @param str 加密的内容
   * @param tripleKey 加密的key
   */
  static tripleDESencrypt(str: string, tripleKey: string = tripleDES.key) {
    // 3DES加密算法
    const key = CryptoJS.enc.Utf8.parse(tripleKey);
    const encryptAction = CryptoJS.TripleDES.encrypt(str, key, {
      iv: CryptoJS.enc.Utf8.parse(tripleDES.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encryptAction.toString();
  }

  /**
   * 3DES解密算法
   * @param str 解密内容
   * @param tripleKey 解密的key
   */
  static tripleDESdecrypt(str: string, tripleKey: string = tripleDES.key) {
    // 3DES解密算法
    const key = CryptoJS.enc.Utf8.parse(tripleKey);
    const decryptAction = CryptoJS.TripleDES.decrypt(str, key, {
      iv: CryptoJS.enc.Utf8.parse(tripleDES.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decryptAction.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 字符串转base64
   * @param str
   */
  static stringToBase64(str: string): string {
    return Buffer.from(str).toString('base64');
  }

  /**
   * base64转字符串
   * @param base64
   */
  static base64ToString(base64: string): string {
    return Buffer.from(base64, 'base64').toString();
  }

  /**
   * 返回文件大小
   * @param size 文件的字节大小
   * @param fixed 保留几位小数
   */
  static getFileSize(size: number, fixed?: number): string {
    if (size === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    const result = size / Math.pow(k, i);
    return (fixed ? result.toFixed(fixed) : result) + sizes[i];
  }

  /**
   * 判断对象是否undefined
   * @param obj
   */
  static isUndefined(obj: any): obj is undefined {
    return typeof obj === 'undefined';
  }

  /**
   * 判断对象是否为空
   * @param obj
   */
  static isEmpty(obj: any): boolean {
    return obj == null || obj === '' || obj === 'undefined';
  }

  static replaceArgsFromJson(
    str = '',
    obj: Record<string, any> = {},
    exp = /\{[A-Za-z0-9\.\[\]]+\}/g,
  ): string {
    if (this.isEmpty(str) || !isPlainObject(obj)) {
      return str;
    }
    let message = '';
    message += str.replace(exp, (match) => {
      // 这里的正则表达式必须含有{}否则取不出key出来的
      // 由于正则中都包含{},但是有可能正则还含有其他字符,导致不一定是去头去尾,所以下面的代码不适用所有情况
      // const index = match.slice(1, -1);
      // 小节:排除{}以外字符都可以,可以写成[^\{\}],这里不需要加.
      const regex = new RegExp(/\{([^\{\}]*)\}/g);
      const isMatch = regex.test(match);
      const index = RegExp.$1;
      if (!isMatch || !has(obj, index)) {
        return match;
      }
      return get(obj, index);
    });

    return message;
  }

  /**
   * 替换占位符
   */
  static replaceArgs(str: string, ...args: Array<string | number>): string {
    let message = '';
    if (typeof str !== 'string') {
      return '';
    }
    message += str.replace(/\{\d+\}/g, function (match: string): string {
      const index = +match.slice(1, -1), //==>\d是什么数字,还有+match是什么意思
        shiftedIndex = index; //==>替换字符的参数位置

      if (shiftedIndex < args.length) {
        return args[shiftedIndex] + '';
      }
      return match;
    });
    return message;
  }

  /**
   * 获取请求ip地址
   */
  static getRequestIP(req: Request) {
    let ip = req.socket.remoteAddress;
    if (ip && typeof ip === 'string') {
      ip = ip.substring(ip.lastIndexOf(':') + 1);
    }
    if (!ipExp.test(ip)) {
      const interfaces = os.networkInterfaces();
      ip = null; //置null
      forEach(interfaces, function (value) {
        if (ip) return false; //ip有值就跳出循环
        forEach(value, function (v) {
          if (v.family === 'IPv4') {
            ip = v.address;
            return false;
          }
        });
      });
    }
    return ip || '127.0.0.1';
  }

  static isHasJsonHeader(req: Request) {
    return (
      req.headers &&
      req.headers['content-type'] &&
      req.headers['content-type'] === 'application/json'
    );
  }

  static isHasRequestedHeader(req: Request) {
    return (
      req.headers &&
      req.headers['content-type'] &&
      req.headers['x-requested-with'] === 'XMLHttpRequest'
    );
  }
}
