/**
 * Create by oliver.wu 2024/9/20
 */
import { Injectable, Inject } from '@nestjs/common';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Collection, Model } from 'mongoose';

import { GlobalService, Utils } from '@/common/utils';
import { CommonResult } from '@/common/dto';
import {
  RespCollectionsNameDto,
  ReqDbStatisticsDto,
  RespDbStatisticsDto,
  DbStatisticsDto,
  RespDbIndexesListDto,
  DbIndexesDto,
} from '../dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';

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

  @Inject()
  private globalService: GlobalService;

  async getDbStatistics(params: ReqDbStatisticsDto) {
    const resp = new RespDbStatisticsDto();
    const collectionStatistics: DbStatisticsDto[] = [];
    const aliasNames = params.aliasNames;

    // 先给一个默认值
    resp.collectionStatistics = collectionStatistics;
    if (Utils.isEmpty(aliasNames)) {
      return resp;
    }

    // 这个是数据库总的状态
    // const dbStats = await this.mongooseConnection.db.stats()
    // 这个是数据库总的信息
    // const serverInfo = await this.mongooseConnection.db.admin().serverInfo();
    // 优先判断数据库版本,必须大于6才可以执行
    const buildInfo = await this.mongooseConnection.db.admin().buildInfo();
    const versionNumber = buildInfo.versionArray[0]
    if(versionNumber < 6) {
      throw new CodeException(
        CodeEnum.DB_VERSION_ERROR,
        this.globalService.serverLang('数据库版本必须6.x以上,当前数据库版本:{0}', 'dbInfo.versionError'),
      );
    }

    // 把别名转换成真实数据库名
    const modelMap = this.getModelMap();
    for (const aliasName of aliasNames) {
      if (modelMap.has(aliasName)) {
        const modelInfo = modelMap.get(aliasName);

        // 这里是npm中的mongodb版本
        // mongodb 4.5.x有效,6.8.0已经没有这个写法了,并且只支持mongodb数据库6以下
        // https://www.mongodb.com/zh-cn/docs/drivers/node/current/upgrade/#version-6.0-breaking-changes
        // const name = modelInfo.collectionName
        // const collStats = await this.mongooseConnection.collection(name).stats()
        // console.log(`ns: ${collStats.ns}`)
        // console.log(`size: ${collStats.size}`)
        // console.log(`storageSize: ${collStats.storageSize}`)
        // console.log(`count: ${collStats.count}`)
        // console.log(`avgObjSize: ${collStats.avgObjSize}`)

        // 这里是安装的数据库版本
        // 新的写法必须使用6.x以上的安装数据库版本执行
        const name = modelInfo.collectionName;
        const collection = this.mongooseConnection.models[modelInfo.modelName];
        const collStats = await collection.aggregate([
          {
            $collStats: {
              // count: {},
              storageStats: {
                // scale: 1024
              },
              // queryExecStats: {},
            },
          },
        ]);
        collectionStatistics.push({
          aliasName,
          countSize: collStats[0].storageStats.count,
          dbSize: +(collStats[0].storageStats.size / 1024).toFixed(2),
          dbIndexSize: +(collStats[0].storageStats.totalIndexSize / 1024).toFixed(2),
          avgObjSize: +(collStats[0].storageStats.avgObjSize / 1024).toFixed(2),
        })
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
    for (const [aliasName] of modelMap) {
      aliasNames.push(aliasName);
    }
    resp.aliasNames = aliasNames;
    return resp;
  }
}
