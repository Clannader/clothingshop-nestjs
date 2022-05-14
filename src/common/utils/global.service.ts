import { Injectable } from '@nestjs/common';
import * as globalVariable from '../constants';
import { i18n } from '../i18n';
import { get } from 'lodash'

@Injectable()
export class GlobalService {
  static GlobalStatic: Record<string, any> = globalVariable;

  /**
   * 判断对象是否为空
   * @param obj
   */
  isEmpty(obj: any): boolean {
    return obj == null || obj === '' || obj === 'undefined';
  }

  /**
   * 系统的翻译函数
   * @param languageType 语言类型
   * @param orgin 原始的中文翻译
   * @param key 翻译的key
   * @param args 其他占位符参数
   */
  lang(
    languageType: 'EN' | 'ZH',
    orgin: string,
    key: string,
    ...args: Array<string | number>
  ): string {
    const properties = i18n[languageType];
    if (this.isEmpty(properties)) {
      return this.replaceArgs(orgin, ...args);
    }
    // const langKey = this.parseProperties(properties, key);
    const langKey = get(properties, key, orgin)
    // if (typeof langKey !== 'string') {
    //   return this.replaceArgs(orgin, ...args);
    // }
    return this.replaceArgs(langKey, ...args);
  }

  private parseProperties(properties: object, key: string): string | undefined {
    const keyList = key.split('.');
    let temp = properties;
    if (keyList.length > 0) {
      keyList.forEach((k) => {
        try {
          temp = temp[k];
          if (this.isEmpty(temp)) {
            return false;
          }
        } catch (e) {
          return false;
        }
      });
    }
    return temp && temp.toString();
  }

  /**
   * 替换占位符
   */
  replaceArgs(str: string, ...args: Array<string | number>): string {
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
}
