/**
 * Create by oliver.wu 2024/10/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { SequenceTypeEnum } from '@/common/enum';
import { SequenceSchemaService } from '@/entities/services';

// @ts-ignore
const cluster = require('node:cluster');

@Injectable()
export class TestTasksService {
  @Inject()
  private readonly sequenceSchemaService: SequenceSchemaService;

  @Interval(3000)
  async handleInterval() {
    // 自从mongodb全部使用await函数后,好像不会同时请求数据库了
    console.log(`服务器ID: ${cluster.worker ? cluster.worker.id : 1}--------------------------`);
    const [err, result] = await this.sequenceSchemaService
      .getNextSequence(SequenceTypeEnum.Message)
      .then((result) => [null, result])
      .catch((err) => [err]);
    if (err) {
      console.error(err);
      return;
    }
    console.log(
      `服务器ID: ${cluster.worker ? cluster.worker.id : 1}, 序列号为:${result.sequenceId}`,
    );
  }
}
