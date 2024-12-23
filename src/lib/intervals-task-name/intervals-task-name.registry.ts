/**
 * Create by oliver.wu 2024/12/20
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class IntervalsTaskNameRegistry {
  private readonly intervalsFunction = new Map<string, any>();

  getIntervalFunctionName() {
    return this.intervalsFunction;
  }

  addIntervalFunctionName(name: string, intervalIFun: Function) {
    const ref = this.intervalsFunction.get(name);
    if (!ref) {
      this.intervalsFunction.set(name, intervalIFun);
    }
  }
}
