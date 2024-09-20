/**
 * Create by oliver.wu 2024/9/20
 */
import { Injectable, Inject } from '@nestjs/common';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { Utils } from '@/common/utils';
import { CommonResult } from '@/common/dto';
import { RespCollectionsNameDto, ReqDbStatisticsDto, RespDbStatisticsDto, DbStatisticsDto } from '../dto';

@Injectable()
export class DatabaseService {
  @InjectConnection()
  private readonly mongooseConnection: Connection;

  getDbStatistics(params: ReqDbStatisticsDto) {
    const resp = new RespDbStatisticsDto();
    const collectionStatistics: DbStatisticsDto[] = []
    const aliasNames = params.aliasNames

    if(Utils.isEmpty(aliasNames)) {
      resp.collectionStatistics = collectionStatistics
      return resp;
    }



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

  async getDbCollectionsName() {
    const resp = new RespCollectionsNameDto();
    const modelNames: string[] = this.mongooseConnection.modelNames(); // 如果不取别名,直接返回这个即可
    const aliasNames: string[] = []
    for (const modelName of modelNames) {
      // @ts-ignore
      aliasNames.push(this.mongooseConnection.models[modelName].getAliasName());
    }
    resp.aliasNames = aliasNames
    return resp;
  }
}
