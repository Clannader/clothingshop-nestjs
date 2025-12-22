/**
 * Create by oliver.wu 2025/12/17
 */
import { Injectable, Inject } from '@nestjs/common';
import { Subject, bufferTime, bufferCount, take, switchMap, map } from 'rxjs';

import { ConfigService } from '@/common/config';
import type { StatUrlCountType } from '@/common/types';
import { StatisticsUrlSchemaService } from '@/entities/services';

// @ts-ignore
const cluster = require('node:cluster');

type InsertUrlCountType = {
  timestamp: Date;
  data: StatUrlCountType[];
};

@Injectable()
export class StatisticsUrlCountService {
  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly statisticsUrlSchemaService: StatisticsUrlSchemaService;

  private readonly statUrlCountSubject = new Subject<StatUrlCountType>();

  constructor() {
    this.init();
  }

  /**
   * 计算最近下一个整分钟
   */
  getNextMinuteDelay() {
    const now = new Date();
    const minutes = now.getMinutes(); // 分钟
    const seconds = now.getSeconds(); // 秒
    const ms = now.getMilliseconds(); // 毫秒
    const nextMinute = minutes + 1;
    return (nextMinute - minutes) * 60 * 1000 - seconds * 1000 - ms;
  }

  init() {
    this.statUrlCountSubject
      .pipe(
        bufferTime(this.getNextMinuteDelay()), // 收集最近整分钟数据
        take(1), // 只取1次
        map((buffer) => {
          // 记录当前时间
          return {
            timestamp: new Date(),
            data: buffer,
          };
        }),
        switchMap((firstBuffer) => {
          // 插入第一次最近整分钟记录
          this.insertManyData([firstBuffer]);
          // 开始转化记录频率,每一分钟一次,收集10次才插入数据库
          return this.statUrlCountSubject.pipe(
            bufferTime(60 * 1000),
            map((buffer) => {
              // 每一次都记录收集时间
              return {
                timestamp: new Date(),
                data: buffer,
              };
            }),
            bufferCount(10),
          );
        }),
      )
      .subscribe((result) => {
        this.insertManyData(result);
      });
  }

  getStatUrlCountSubject() {
    return this.statUrlCountSubject;
  }

  insertManyData(result: InsertUrlCountType[]) {
    // const startDate = new Date();
    // startDate.setSeconds(0);
    // startDate.setMilliseconds(0);
    const urlCountArray = [];
    result.forEach((item) => {
      const buffer = item.data;
      const startDate = item.timestamp;
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      const urlMap = new Map();
      buffer.forEach((urlCount) => {
        const key = `${urlCount.shopId}_${urlCount.url}`;
        if (urlMap.has(key)) {
          urlMap.get(key).count += 1;
        } else {
          urlMap.set(key, {
            shopId: urlCount.shopId,
            url: urlCount.url,
            count: 1,
            date: startDate,
            serverName: this.configService.get<string>('serverName'),
            workerId: cluster?.worker?.id ?? 1,
          });
        }
      });
      if (urlMap.size > 0) {
        urlCountArray.push(...Array.from(urlMap.values()));
      }
    });
    if (urlCountArray.length > 0) {
      this.statisticsUrlSchemaService
        .getStatisticsUrlModel()
        .insertMany(urlCountArray)
        .then()
        .catch((err) => {
          console.error(err);
        });
    }
  }
}
