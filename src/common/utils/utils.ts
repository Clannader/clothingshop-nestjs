import * as CryptoJS from 'crypto-js';
import { tripleDES } from '../constants';
import { get, isPlainObject, has } from 'lodash';

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

  static replaceArgsFromJson(str: string = '', obj: Record<string, any> = {}): string {
    if (this.isEmpty(str) || !isPlainObject(obj)) {
      return str
    }
    const exp = /\{[A-Za-z\.]+\}/g
    let message = ''
    message += str.replace(exp, match => {
      const index = match.slice(1, -1)
      if (!has(obj, index)) {
        return match
      }
      return get(obj, index)
    })

    return message
  }
}
