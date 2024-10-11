/**
 * Create by oliver.wu 2024/10/11
 */
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TestTasksService {
  @Interval(3000)
  handleInterval() {
    console.log('Called every 3 seconds');
  }
}
