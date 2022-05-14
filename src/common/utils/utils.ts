import * as CryptoJS from 'crypto-js'
import { tripleDES } from '../constants'

/**
 * 系统工具类
 */
export class Utils {
  /**
   * 转义32位和64位系统时的斜杠
   * @param path 需要转义的路径
   */
  static escapePath(path: string = ''): string {
    if (process.platform === 'win32') return path.replace(/\/+/g, '\\');
    else return path.replace(/\\+/g, '//');
  }

  /**
   * 转义特殊字符
   * @param str 需要转义的字符串
   */
  static escapeString(str: string = ''): string {
    return str.replace(/([.*+?^=!${}()|\[\]\/\\])/g, '\\$1')
  }

  static md5(str: string):string {
    return CryptoJS.MD5(str).toString()
  }

  static sha256(str: string, key?:string) {
    if (key) {
      return CryptoJS.HmacSHA256(str, key).toString()
    }
    return CryptoJS.SHA256(str).toString()
  }

  static sha1(str: string, key?:string) {
    if (key) {
      return CryptoJS.HmacSHA1(str, key).toString()
    }
    return CryptoJS.SHA1(str).toString()
  }

  static tripleDESencrypt(str: string = '', tripleKey?:string) {
    // 3DES加密算法
    const key = CryptoJS.enc.Utf8.parse(tripleKey || tripleDES.key)
    const encryptAction = CryptoJS.TripleDES.encrypt(str, key, {
      iv: CryptoJS.enc.Utf8.parse(tripleDES.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return encryptAction.toString()
  }

  static tripleDESdecrypt(str: string = '', tripleKey?:string) {
    // 3DES解密算法
    const key = CryptoJS.enc.Utf8.parse(tripleKey || tripleDES.key)
    const decryptAction = CryptoJS.TripleDES.decrypt(str, key, {
      iv: CryptoJS.enc.Utf8.parse(tripleDES.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return decryptAction.toString(CryptoJS.enc.Utf8)
  }
}
