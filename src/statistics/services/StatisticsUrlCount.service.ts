/**
 * Create by oliver.wu 2025/12/17
 */
import { Injectable, Inject } from '@nestjs/common';
import { Subject, bufferTime, bufferCount, take, switchMap } from 'rxjs';

import { ConfigService } from '@/common/config';
import type { StatUrlCountType } from '@/common/types';
import { StatisticsUrlSchemaService } from '@/entities/services';

// @ts-ignore
const cluster = require('node:cluster');

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
        take(1), // 取一条
        switchMap((firstBuffer) => {
          this.insertManyData(firstBuffer);
          return this.statUrlCountSubject.pipe(
            bufferTime(60 * 1000),
            bufferCount(10),
          );
        }),
      )
      .subscribe((result) => {
        this.insertManyData(result.flat());
      });
  }

  getStatUrlCountSubject() {
    return this.statUrlCountSubject;
  }

  insertManyData(result: StatUrlCountType[]) {
    const startDate = new Date();
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const urlMap = new Map();
    result.forEach((item) => {
      const key = `${item.shopId}_${item.url}`;
      if (urlMap.has(key)) {
        urlMap.get(key).count += 1;
      } else {
        urlMap.set(key, {
          shopId: item.shopId,
          url: item.url,
          count: 1,
          date: startDate,
          serverName: this.configService.get<string>('serverName'),
          workerId: cluster?.worker?.id ?? 1,
        });
      }
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
