/**
 * Create by oliver.wu 2024/9/20
 */
import { Injectable, Inject } from '@nestjs/common';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { Utils } from '@/common/utils';
import { CommonResult } from '@/common/dto';
import { RespCollectionsNameDto, ReqDbStatisticsDto, RespDbStatisticsDto, DbStatisticsDto, RespDbIndexesListDto } from '../dto';

@Injectable()
export class DatabaseService {
  @InjectConnection()
  private readonly mongooseConnection: Connection;

  async getDbStatistics(params: ReqDbStatisticsDto) {
    const resp = new RespDbStatisticsDto();
    const collectionStatistics: DbStatisticsDto[] = []
    const aliasNames = params.aliasNames

    // 先给一个默认值
    resp.collectionStatistics = collectionStatistics
    if(Utils.isEmpty(aliasNames)) {
      return resp;
    }
    // 把别名转换成真实数据库名
    const dbName: string[] = []
    const modelNames: string[] = this.mongooseConnection.modelNames();
    for (const modelName of modelNames) {
      // @ts-ignore
      const alias = this.mongooseConnection.models[modelName].getAliasName();
      if (aliasNames.includes(alias)) {
        // dbName.push(this.mongooseConnection.collection('dd'))
      }
    }
    console.log(dbName)
    // @ts-ignore
    const a = await this.mongooseConnection.collection('admins').getIndexes()
    console.log(this.mongooseConnection.collections['admins'])
    console.log(a)
    return resp;
  }

  getDbIndexList(params: ReqDbStatisticsDto) {
    const resp = new RespDbIndexesListDto();
    const collections = this.mongooseConnection.collections // 所有连接名

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
