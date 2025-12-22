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
        take(1),
        map((buffer) => {
          return {
            timestamp: new Date(),
            data: buffer,
          }
        }),
        switchMap((firstBuffer) => {
          this.insertManyData([firstBuffer]);
          return this.statUrlCountSubject.pipe(
            bufferTime(60 * 1000),
            map((buffer) => {
              return {
                timestamp: new Date(),
                data: buffer,
              }
            }),
            bufferCount(2),
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
    const urlMap = new Map();
    result.forEach((item) => {
      const buffer = item.data;
      const startDate = item.timestamp;
      buffer.forEach(urlCount => {
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
      })
    });
    if (urlMap.size > 0) {
      const insertData = Array.from(urlMap.values());
      this.statisticsUrlSchemaService
        .getStatisticsUrlModel()
        .insertMany(insertData)
        .then()
        .catch((err) => {
          console.error(err);
        });
    }
  }
}
