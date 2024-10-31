/**
 * Create by oliver.wu 2024/10/11
 */
import { Injectable, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { LogTypeEnum, SequenceTypeEnum } from '@/common/enum';
import {
  AdminLogSchemaService,
  SequenceSchemaService,
} from '@/entities/services';
import type { AdminLog } from '@/entities/schema';
import { TokenCacheService } from '@/cache/services';

// @ts-ignore
const cluster = require('node:cluster');

@Injectable()
export class TestTasksService {
  @Inject()
  private readonly sequenceSchemaService: SequenceSchemaService;

  @Inject()
  private readonly adminLogSchemaService: AdminLogSchemaService;

  @Inject()
  private readonly tokenCacheService: TokenCacheService;

  @Interval(3000)
  async handleInterval() {
    // 自从mongodb全部使用await函数后,好像不会同时请求数据库了
    const value = await this.tokenCacheService.getTokenCache('1111');
    console.log(
      `服务器ID: ${cluster.worker ? cluster.worker.id : 1}--------------------------${value}`,
    );
    // const [err, result] = await this.sequenceSchemaService
    //   .getNextSequence(SequenceTypeEnum.Message)
    //   .then((result) => [null, result])
    //   .catch((err) => [err]);
    // if (err) {
    //   console.error(err);
    //   return;
    // }
    // console.log(
    //   `服务器ID: ${cluster.worker ? cluster.worker.id : 1}, 序列号为:${result.sequenceId}`,
    // );
    // const logInfo: AdminLog = {
    //   adminId: 'SYSTEM',
    //   adminName: 'Supervisor',
    //   content: `服务器ID: ${cluster.worker ? cluster.worker.id : 1}, 序列号为:${result.sequenceId}`,
    //   shopId: 'SYSTEM',
    //   type: LogTypeEnum.Config,
    //   traceId: Date.now().toString(),
    // };
    // await this.adminLogSchemaService.createUserLog(logInfo);
  }
}
