import { Injectable, Type } from '@nestjs/common';
// import { REQUEST } from '@nestjs/core';
// import { Request } from 'express';

import * as globalVariable from '../constants';
import { LanguageType, CmsSession, WRITE_LOG } from '@/common';
import type { MetadataLog } from '@/common/decorator';
import { Utils } from '@/common/utils';
import * as moment from 'moment';

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
    return Utils.lang(session.language || 'EN', origin, key, ...args);
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

  /**
   * 比较对象写日志
   */
  compareObjectWriteLog<TClass = any>(
    session: CmsSession,
    target: Type<TClass>,
    oldObject: TClass,
    newObject: TClass,
  ): string[] {
    // 初步参数定义:表的class,新值,旧值
    // 逻辑,通过class获取所有的字段,遍历字段名,判断是否含有改字段,然后判断新旧值差异
    // 通过注解在class上的@xxxx('翻译', 'xx.xx') => 某字段: {0} -> {1}
    // 判断字段类型如果是数组,则变成新增xx,删除xx,改xx,如果是日期则格式化,如果是其他则另做打算
    // 然后返回数组
    const metaDataArray: MetadataLog[] = Reflect.getMetadata(
      WRITE_LOG,
      target.prototype,
    );
    const logArray = [];
    metaDataArray.forEach((metaData) => {
      const propertyType = metaData.propertyType;
      const oldValue = oldObject[metaData.propertyName];
      const newValue = newObject[metaData.propertyName];
      const title = this.serverLang(session, metaData.origin, metaData.key); // 字段翻译
      const piiData = metaData.piiData; // 是否是敏感字段,写日志的值需要脱敏
      if ([String, Number, Boolean].includes(propertyType)) {
        if (oldValue !== newValue) {
          const fromValue = oldValue ?? 'null';
          const toValue = newValue ?? 'null';
          logArray.push(
            `${title}: ${piiData ? Utils.piiData(fromValue) : fromValue} -> ${piiData ? Utils.piiData(toValue) : toValue}`,
          );
        }
      } else if (Date === propertyType) {
        const oldDate = moment(oldValue || null); // moment如果是null就可以是无效的日期,但是如果是undefined,会默认当前时间
        const newDate = moment(newValue || null);
        if (!oldDate.isSame(newDate)) {
          logArray.push(
            `${title}: ${oldDate.isValid() ? oldDate.utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ') : 'null'} 
            -> ${newDate.isValid() ? newDate.utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ') : 'null'}`,
          );
        }
      } else if (this.isClass(propertyType)) {
        logArray.push(
          ...this.compareObjectWriteLog(
            session,
            propertyType,
            oldValue ?? new propertyType(), // 没有值时,就创建一个空对象
            newValue ?? new propertyType(),
          ),
        );
      }
    });
    return logArray;
  }

  // 判断是否是class对象
  isClass(target: any): boolean {
    return (
      typeof target === 'function' && /^\s*class\s+/.test(target.toString())
    );
  }

  // 该用户是否含有该权限
  userIsHasRights(session: CmsSession, ...rightsArray: Array<string>) {
    return rightsArray.every((v) => session.rights.includes(v));
  }
}
