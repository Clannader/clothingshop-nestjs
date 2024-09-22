/**
 * Create by oliver.wu 2024/9/20
 */
import { Injectable, Inject } from '@nestjs/common';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Collection, Model } from 'mongoose';

import { Utils } from '@/common/utils';
import { CommonResult } from '@/common/dto';
import {
  RespCollectionsNameDto,
  ReqDbStatisticsDto,
  RespDbStatisticsDto,
  DbStatisticsDto,
  RespDbIndexesListDto,
  DbIndexesDto,
} from '../dto';

type ModelMap = {
  modelName: string;
  collectionName: string;
};

interface CustomCollection extends Collection {
  modelName: string;
}

interface CustomModel extends Model<any> {
  getAliasName(): string;
}

@Injectable()
export class DatabaseService {
  @InjectConnection()
  private readonly mongooseConnection: Connection;

  async getDbStatistics(params: ReqDbStatisticsDto) {
    const resp = new RespDbStatisticsDto();
    const collectionStatistics: DbStatisticsDto[] = [];
    const aliasNames = params.aliasNames;

    // 先给一个默认值
    resp.collectionStatistics = collectionStatistics;
    if (Utils.isEmpty(aliasNames)) {
      return resp;
    }
    // 把别名转换成真实数据库名
    const modelMap = this.getModelMap()
    for (const aliasName of aliasNames) {
      if (modelMap.has(aliasName)) {
        const modelInfo = modelMap.get(aliasName);
        // 这个是数据库总的状态
        // const dbStats = await this.mongooseConnection.db.stats()
        // 这个是数据库总的信息
        // const serverInfo = await this.mongooseConnection.db.admin().serverInfo()

        // mongodb 4.5.x有效,6.8.0已经没有这个写法了
        // const name = modelInfo.collectionName
        // const collStats = await this.mongooseConnection.collection(name).stats()
        // console.log(`ns: ${collStats.ns}`)
        // console.log(`size: ${collStats.size}`)
        // console.log(`storageSize: ${collStats.storageSize}`)
        // console.log(`count: ${collStats.count}`)
        // console.log(`avgObjSize: ${collStats.avgObjSize}`)
      }
    }
    return resp;
  }

  private getModelMap(): Map<string, ModelMap> {
    const modelMap = new Map<string, ModelMap>();
    const collections = this.mongooseConnection.collections; // 所有连接名
    for (const collection in collections) {
      const value = collections[collection] as CustomCollection;
      const modelName = value.modelName;
      const aliasName = (
        this.mongooseConnection.models[modelName] as CustomModel
      ).getAliasName();
      modelMap.set(aliasName, {
        collectionName: value.collectionName,
        modelName,
      });
    }
    return modelMap;
  }

  async getDbIndexList(params: ReqDbStatisticsDto) {
    const resp = new RespDbIndexesListDto();
    const indexesList: DbIndexesDto[] = [];
    const aliasNames = params.aliasNames;

    // 先给一个默认值
    resp.indexes = indexesList;
    if (Utils.isEmpty(aliasNames)) {
      return resp;
    }
    // 构造一个Map,<aliasName, {modelName, collectionName}>
    const modelMap = this.getModelMap();
    // 遍历有效的数据库名
    for (const aliasName of aliasNames) {
      if (modelMap.has(aliasName)) {
        const collectionName = modelMap.get(aliasName).collectionName;
        const indexArray = await this.mongooseConnection
          .collection(collectionName)
          .indexInformation({ full: true });
        for (const indexInfo of indexArray) {
          if (indexInfo.name === '_id_') {
            continue;
          }
          indexesList.push({
            aliasName,
            indexName: indexInfo.name,
            indexOptions: {}, // TODO 后期再修改
            indexFields: indexInfo.key,
            indexStatus: 1, // 后期再加入判断
          });
        }
      }
    }
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
    const aliasNames: string[] = [];
    // const modelNames: string[] = this.mongooseConnection.modelNames(); // 如果不取别名,直接返回这个即可
    // for (const modelName of modelNames) {
    //   aliasNames.push(
    //     (
    //       this.mongooseConnection.models[modelName] as CustomModel
    //     ).getAliasName(),
    //   );
    // }
    const modelMap = this.getModelMap();
    for(const [aliasName] of modelMap) {
      aliasNames.push(aliasName)
    }
    resp.aliasNames = aliasNames;
    return resp;
  }
}
