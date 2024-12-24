/**
 * Create by oliver.wu 2024/12/20
 */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  SchedulerType,
  SCHEDULER_NAME,
  SCHEDULER_TYPE,
  SCHEDULE_INTERVAL_OPTIONS,
} from '@andybeat/schedule';
import { IntervalMetadata } from '@andybeat/schedule/dist/interfaces/interval-metadata.interface';

@Injectable()
export class IntervalsTaskNameAccessor {
  constructor(private readonly reflector: Reflector) {}

  getSchedulerType(target: Function): SchedulerType | undefined {
    return this.getMetadata(SCHEDULER_TYPE, target);
  }

  getSchedulerName(target: Function): string | undefined {
    return this.getMetadata(SCHEDULER_NAME, target);
  }

  getIntervalMetadata(target: Function): IntervalMetadata | undefined {
    return this.getMetadata(SCHEDULE_INTERVAL_OPTIONS, target);
  }

  private getMetadata<T>(key: string, target: Function): T | undefined {
    const isObject =
      typeof target === 'object'
        ? target !== null
        : typeof target === 'function';

    return isObject ? this.reflector.get(key, target) : undefined;
  }
}
