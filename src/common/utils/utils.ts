import * as CryptoJS from 'crypto-js';
import { tripleDES, ipExp, Supervisor_Rights } from '../constants';
import { get, isPlainObject, has, forEach, cloneDeep, set } from 'lodash';
import { Request } from 'express';
import * as os from 'os';
import { CmsSession } from '../common.types';
import { v4 } from 'node-uuid';

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
   * @param excludeBlank 排除''这个判断
   */
  static isEmpty(obj: any, excludeBlank = false): boolean {
    if (obj == null) {
      return true;
    }
    if (typeof obj === 'string') {
      return (
        obj.trim() === 'undefined' || (excludeBlank ? false : obj.trim() === '')
      );
    }
    if (Array.isArray(obj)) {
      return obj.length === 0;
    }
    return false;
  }

  static replaceArgsFromJson(str: string): string;
  static replaceArgsFromJson(str: string, obj: Record<string, any>): string;
  static replaceArgsFromJson(
    str: string,
    obj: Record<string, any>,
    exp: RegExp,
  ): string;
  static replaceArgsFromJson(
    str: string,
    obj: Record<string, any>,
    isReturnNull: boolean,
  ): string;
  static replaceArgsFromJson(
    str = '',
    obj: Record<string, any> = {},
    exp: RegExp | boolean = /\{[A-Za-z0-9\.\[\]]+\}/g,
    isReturnNull = false,
  ): string {
    if (this.isEmpty(str) || !isPlainObject(obj)) {
      return str;
    }
    let message = '';
    if (typeof exp === 'boolean') {
      isReturnNull = exp;
      exp = /\{[A-Za-z0-9\.\[\]]+\}/g;
    }
    message += str.replace(exp, (match) => {
      // 这里的正则表达式必须含有{}否则取不出key出来的
      // 由于正则中都包含{},但是有可能正则还含有其他字符,导致不一定是去头去尾,所以下面的代码不适用所有情况
      // const index = match.slice(1, -1);
      // 小节:排除{}以外字符都可以,可以写成[^\{\}],这里不需要加.
      const regex = new RegExp(/\{([^\{\}]*)\}/g);
      const isMatch = regex.test(match);
      const index = RegExp.$1;
      if (!isMatch || !has(obj, index)) {
        return isReturnNull ? '' : match;
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

  static isHasJsonHeader(/*req: Request*/) {
    return true;
    // return (
    //   req.headers['content-type'] === 'application/json' ||
    //   req.headers['accept'] === 'application/json' ||
    //   req.headers['content-type'] === 'multipart/form-data'
    // );
  }

  static isHasRequestedHeader(req: Request) {
    return req.headers['x-requested-with'] === 'XMLHttpRequest';
  }

  static isHasSoapHeader(req: Request) {
    const xmlHeader = req.headers['content-type'];
    return xmlHeader && xmlHeader.indexOf('xml') !== -1;
  }

  static stringifyParams(
    obj: Record<string, string>,
    sep = '&',
    eq = '=',
  ): string {
    const temp = JSON.stringify(obj);
    if (!isPlainObject(obj) || Object.keys(obj).length === 0) {
      return temp;
    }
    const arr = [];
    this.appendParams(arr, obj, eq);
    const returnArr = [];
    forEach(arr, (value) => {
      returnArr.push(value);
    });
    return returnArr.join(sep);
  }

  private static appendParams(
    arr: string[],
    obj: Record<string, any>,
    eq: string,
    prefix?: string,
  ) {
    forEach(obj, (value, key) => {
      if (prefix) key = prefix + '.' + key;
      let row = JSON.stringify(value);
      if (!isPlainObject(value) || row === '{}') {
        //值不是对象,或者是数组处理
        if (row === 'null' || row === undefined) {
          row = '';
        }
        arr.push(key + eq + row);
      } else {
        //值是一个对象处理
        this.appendParams(arr, value, eq, key);
      }
    });
  }

  static getIgnoreCase(fieldName: string, mode = false) {
    if (mode) {
      // mode=true就是模糊查询
      return { $regex: fieldName, $options: 'i' };
    }
    return { $regex: '^' + fieldName + '$', $options: 'i' };
  }

  static isSupervisor(session: CmsSession) {
    return (
      'SUPERVISOR' === session.adminId.toUpperCase() ||
      (session.orgRights.length === 1 && session.orgRights[0] === 'SUPERVISOR')
    );
  }

  static getSuper() {
    return {
      adminId: 'SUPERVISOR',
      adminName: '系统超级用户',
      password: this.sha256('s'),
      shopId: ['SYSTEM'],
      rights: Supervisor_Rights,
      adminType: 'SYSTEM',
      adminStatus: true,
      email: '294473343@qq.com',
      createUser: 'SYSTEM',
      createDate: new Date(),
      isFirstLogin: true,
    };
  }

  /**
   * 保留前几后几位数,中间*号
   */
  static piiData(str = '', start = 3, end = 3) {
    const regExp = new RegExp(
      `([\\s\\S]{${start}})([\\s\\S]*)([\\s\\S]{${end}})$`,
      'g',
    );
    return str.replace(regExp, '$1******$3');
  }

  /**
   * JSON数据脱敏方法
   */
  static piiJsonData(
    jsonData: Record<string, any>,
    ...args: string[]
  ): Record<string, any> {
    const piiJson = this.piiJson(jsonData, ...args);
    forEach(args, (key) => {
      if (has(piiJson, key)) {
        const value = get(piiJson, key);
        if (typeof value === 'string' && value.indexOf('******') === -1) {
          set(piiJson, key, this.piiData(value));
        }
      }
    });
    return piiJson;
  }

  private static piiJson(jsonData: Record<string, any>, ...args: string[]) {
    // 先克隆一份json数据,不对原始数据进行修改
    const piiJson = cloneDeep(jsonData);
    // 循环克隆的json数据
    forEach(piiJson, (value, key) => {
      // 判断json数据的key是否是传入需要脱敏的字段值,并且只能脱敏字符串类型的数据
      if (args.includes(key) && typeof value === 'string') {
        piiJson[key] = this.piiData(value);
        return true; // 相当于continue
      } else if (Array.isArray(value)) {
        // 如果值是数组,循环判断
        piiJson[key] = value.map((v) => {
          return this.piiJson(v, ...args);
        });
        return true;
      } else if (isPlainObject(value)) {
        piiJson[key] = this.piiJson(value, ...args);
        return true;
      }
    });
    return piiJson;
  }

  /**
   * XML数据脱敏方法
   * @param xmlData xml字符串
   * @param args xml里面的节点
   */
  static piiXmlData(xmlData: string, ...args: string[]): string {
    args.forEach((v) => {
      const matchArr = xmlData.match(
        `(<.{0,8}?:{0,1}${v}(\\s.*){0,1}>([\\s\\S]*)<.{0,8}?:{0,1}${v}>)`,
      );
      if (matchArr) {
        const matchContent = matchArr[0]; // 匹配的节点内容
        const matchValue = matchArr[3]; // 节点的值
        // 把节点内容的值替换后再拼回去xml的内容里面
        xmlData = xmlData.replace(
          matchContent,
          matchContent.replace(matchValue, this.piiData(matchValue)),
        );
      }
    });
    return xmlData;
  }

  static getUuid(): string {
    return v4().replace(/\-/g, '')
  }
}
