import { Inject, Injectable } from '@nestjs/common';
import * as globalVariable from '../constants';
import { i18n } from '../i18n';
import { languageType } from '@/common';
import { Utils } from '@/common/utils';
import { get } from 'lodash';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class GlobalService {
  static GlobalStatic: Record<string, any> = globalVariable;

  /**
   * 使用这样的注入方式,确实可以每个请求独立开来,这样翻译并发的时候也不会串,但是
   * 有一点就是使用了这样的注入,导致了这个类每个请求进来的时候都是实例化的,请求
   * 完成以后估计就被回收
   */
  @Inject(REQUEST)
  private readonly request: Request;

  /**
   * 系统的翻译函数
   * @param languageType 语言类型
   * @param orgin 原始的中文翻译
   * @param key 翻译的key
   * @param args 其他占位符参数
   */
  lang(
    languageType: languageType,
    orgin: string,
    key: string,
    ...args: Array<string | number>
  ): string {
    const properties = i18n[languageType];
    if (Utils.isEmpty(properties)) {
      return Utils.replaceArgs(orgin, ...args);
    }
    // const langKey = this.parseProperties(properties, key);
    const langKey = get(properties, key, orgin) as string;
    // if (typeof langKey !== 'string') {
    //   return this.replaceArgs(orgin, ...args);
    // }
    return Utils.replaceArgs(langKey, ...args);
  }

  serverLang(orgin: string, key: string, ...args: Array<string | number>) {
    return this.lang(
      this.getHeadersLanguage(this.request),
      orgin,
      key,
      ...args,
    );
  }

  getHeadersLanguage(request: Request): languageType {
    const headerLanguage = request.headers['language'];
    return Utils.isEmpty(headerLanguage)
      ? 'ZH'
      : ['ZH', 'EN'].includes(
            typeof headerLanguage === 'string' ? headerLanguage : 'ZH',
          )
        ? (headerLanguage as languageType)
        : 'ZH';
  }

  private parseProperties(properties: object, key: string): string | undefined {
    const keyList = key.split('.');
    let temp = properties;
    if (keyList.length > 0) {
      keyList.forEach((k) => {
        try {
          temp = temp[k];
          if (Utils.isEmpty(temp)) {
            return false;
          }
        } catch (e) {
          return false;
        }
      });
    }
    return temp && temp.toString();
  }
}
