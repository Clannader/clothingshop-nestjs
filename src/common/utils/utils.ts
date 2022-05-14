import * as CryptoJS from 'crypto-js';
import { tripleDES } from '../constants';

/**
 * 系统工具类
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

  /**
   * 转义特殊字符
   * @param str 需要转义的字符串
   */
  static escapeString(str = ''): string {
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

  static tripleDESencrypt(str = '', tripleKey?: string) {
    // 3DES加密算法
    const key = CryptoJS.enc.Utf8.parse(tripleKey || tripleDES.key);
    const encryptAction = CryptoJS.TripleDES.encrypt(str, key, {
      iv: CryptoJS.enc.Utf8.parse(tripleDES.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encryptAction.toString();
  }

  static tripleDESdecrypt(str = '', tripleKey?: string) {
    // 3DES解密算法
    const key = CryptoJS.enc.Utf8.parse(tripleKey || tripleDES.key);
    const decryptAction = CryptoJS.TripleDES.decrypt(str, key, {
      iv: CryptoJS.enc.Utf8.parse(tripleDES.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decryptAction.toString(CryptoJS.enc.Utf8);
  }

  static stringToBase64(str = ''): string {
    return Buffer.from(str).toString('base64');
  }

  static base64ToString(base64 = ''): string {
    return Buffer.from(base64, 'base64').toString();
  }

  static getFileSize(size: number, fixed?: number): string {
    if (size === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    const result = size / Math.pow(k, i);
    return (fixed ? result.toFixed(fixed) : result) + sizes[i];
  }
}
