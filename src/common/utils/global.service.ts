import { Inject, Injectable } from '@nestjs/common';
// import { REQUEST } from '@nestjs/core';
// import { Request } from 'express';

import * as globalVariable from '../constants';
import { LanguageType, CmsSession } from '@/common';
import { Utils } from '@/common/utils';

@Injectable()
export class GlobalService {
  static GlobalStatic: Record<string, any> = globalVariable;

  /**
   * 使用这样的注入方式,确实可以每个请求独立开来,这样翻译并发的时候也不会串,但是
   * 有一点就是使用了这样的注入,导致了这个类每个请求进来的时候都是实例化的,请求
   * 完成以后估计就被回收
   * 秉持着单例原则,就暂时注释掉吧,不这样使用了
   */
  // @Inject(REQUEST)
  // private readonly request: Request;

  lang(
    language: LanguageType,
    origin: string,
    key: string,
    ...args: Array<string | number>
  ) {
    return Utils.lang(language, origin, key, ...args);
  }

  serverLang(
    session: CmsSession,
    origin: string,
    key: string,
    ...args: Array<string | number>
  ) {
    return Utils.lang(session.language, origin, key, ...args);
  }

  /**
   * 通过json的路径获取接送中的key值,{a:{b:{c:2}}}, 'a.b.c' = 2
   * @param properties
   * @param key
   * @private
   */
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
