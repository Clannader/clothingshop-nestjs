/**
 * Create by oliver.wu 2024/11/5
 */
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry, Cron } from '@nestjs/schedule';

import { IntervalsTaskNameRegistry } from '@/lib/intervals-task-name';
import * as moment from 'moment';

// 启动时,取最近的一次整点做重置定时器任务的时间
// 这里要注意一点,发现如果在xx:59:xx这种准备到下一个整点的时候启动时,刚启动就执行任务会报错
// 所以以后启动服务器不能太靠近整点,如果按照分钟数判断是整点还是半点,又会导致多台服务器时
// 有些服务器在整点,有些服务器在半点也不可取,所以只能控制启动的时间了
const startDate = moment();
// if (startDate.minutes() >= 0) {
// 改成2小时后,就算靠近第一个整点也不会出现报错问题了
// startDate.add(2, 'hours');
// }
startDate.add(2, 'hours');
startDate.minutes(0);
startDate.seconds(0);
startDate.milliseconds(0);

@Injectable()
export class SyncAllTasksService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly intervalsTaskNameRegistry: IntervalsTaskNameRegistry,
  ) {}

  @Cron(startDate.toDate())
  reSetAllTasks() {
    // 获取所有定时器任务,然后进行重启
    // 一般没有延迟器的逻辑,延迟器的话不需要重启
    // 获取所有定时器任务,然后取消,然后重启
    const intervalKeys = this.schedulerRegistry.getIntervals();
    const intervalService =
      this.intervalsTaskNameRegistry.getIntervalFunctionName();
    const resetIntervalMap = new Map<string, any>();
    intervalKeys.forEach((intervalKey) => {
      const oldInterval = this.schedulerRegistry.getInterval(intervalKey);
      this.schedulerRegistry.deleteInterval(intervalKey);
      const newInterval = setInterval(
        intervalService.get(intervalKey),
        oldInterval._repeat,
      );
      resetIntervalMap.set(intervalKey, newInterval);
    });
    for (const [key, interval] of resetIntervalMap) {
      this.schedulerRegistry.addInterval(key, interval);
    }
  }
}
