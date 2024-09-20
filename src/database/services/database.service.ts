/**
 * Create by oliver.wu 2024/9/20
 */
import { Injectable, Inject } from '@nestjs/common';

import { MongooseConfigService } from '@/dao';

import { CommonResult } from '@/common/dto';
import { RespCollectionsName } from '../dto';

@Injectable()
export class DatabaseService {
  @Inject()
  private readonly mongooseConfigService: MongooseConfigService;

  getDbStatistics() {
    const resp = new CommonResult();
    return resp;
  }

  getDbIndexList() {
    const resp = new CommonResult();
    return resp;
  }

  getDbDetails() {
    const resp = new CommonResult();
    return resp;
  }

  getDbLogs() {
    const resp = new CommonResult();
    return resp;
  }

  getDbCollectionsName() {
    const resp = new RespCollectionsName();
    const connection = this.mongooseConfigService.getConnection()
    console.log(connection.modelNames());
    return resp;
  }
}
