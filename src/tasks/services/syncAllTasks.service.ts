/**
 * Create by oliver.wu 2024/11/5
 */
import { Injectable, Inject } from '@nestjs/common';
import { SchedulerRegistry, Cron } from '@nestjs/schedule';

// import { TestIntervalName, TestIntervalType } from '../tasks.constants';
import { TestTasksService } from './test.tasks.service';
import * as moment from 'moment';

// 启动时,取最近的一次整点做重置定时器任务的时间
const startDate = moment();
if (startDate.minutes() > 0) {
  startDate.add(1, 'hours');
}
startDate.minutes(0);
startDate.seconds(0);
startDate.milliseconds(0);

@Injectable()
export class SyncAllTasksService {
  @Inject()
  private readonly testTasksService: TestTasksService;

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  @Cron(startDate.toDate())
  reSetAllTasks() {
    // 获取所有定时器任务,然后进行重启
    // 一般没有延迟器的逻辑,延迟器的话不需要重启
    // 获取所有定时器任务,然后取消,然后重启
    const intervalKeys = this.schedulerRegistry.getIntervals();
    const intervalService = {
      TestIntervalName: this.testTasksService.handleInterval,
      TestIntervalType: this.testTasksService.handleTestInterval,
    };
    const resetIntervalMap = new Map<string, any>();
    intervalKeys.forEach((intervalKey) => {
      const oldInterval = this.schedulerRegistry.getInterval(intervalKey);
      this.schedulerRegistry.deleteInterval(intervalKey);
      const newInterval = setInterval(
        intervalService[intervalKey],
        oldInterval._repeat,
      );
      resetIntervalMap.set(intervalKey, newInterval);
    });
    for (const [key, interval] of resetIntervalMap) {
      this.schedulerRegistry.addInterval(key, interval);
    }
  }
}
