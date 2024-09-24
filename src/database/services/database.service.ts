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
import { CodeEnum, DbIndexType } from '@/common/enum';

import {
  defaultIndexes,
  type IndexOptions,
  IndexSchema,
} from '@/system/defaultSystemData';

export type ModelMap = {
  modelName: string;
  collectionName: string;
};

export interface CustomCollection extends Collection {
  modelName: string;
}

export interface CustomModel extends Model<any> {
  getAliasName(): string;
}

@Injectable()
export class DatabaseService {
  @InjectConnection()
  private readonly mongooseConnection: Connection;

  @Inject()
  private globalService: GlobalService;

  private indexMap: Map<string, IndexSchema[]> = new Map<string, IndexSchema[]>();

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
    const versionNumber = buildInfo.versionArray[0];
    if (versionNumber < 6) {
      throw new CodeException(
        CodeEnum.DB_VERSION_ERROR,
        this.globalService.serverLang(
          '数据库版本必须6.x以上,当前数据库版本:{0}',
          'dbInfo.versionError',
          buildInfo.version,
        ),
      );
    }

    // 把别名转换成真实数据库名
    const modelMap = this.getModelMap();
    const fractionDigits = 2;
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
        // const name = modelInfo.collectionName;
        const collection = this.mongooseConnection.models[modelInfo.modelName];
        const [error, collStats] = await collection
          .aggregate([
            {
              $collStats: {
                // count: {},
                storageStats: {
                  // scale: 1024
                },
                // queryExecStats: {},
              },
            },
          ])
          .then((result) => [null, result])
          .catch((err) => [err]);
        if (error) {
          throw new CodeException(CodeEnum.DB_EXEC_ERROR, error.message);
        }
        collectionStatistics.push({
          aliasName,
          countSize: collStats[0].storageStats.count,
          dbSize: +(collStats[0].storageStats.size / 1024).toFixed(
            fractionDigits,
          ),
          dbSizeLabel: Utils.getFileSize(
            collStats[0].storageStats.size,
            fractionDigits,
          ),
          dbIndexSize: +(
            collStats[0].storageStats.totalIndexSize / 1024
          ).toFixed(fractionDigits),
          dbIndexSizeLabel: Utils.getFileSize(
            collStats[0].storageStats.totalIndexSize,
            fractionDigits,
          ),
          avgObjSize: +(collStats[0].storageStats.avgObjSize / 1024).toFixed(
            fractionDigits,
          ),
          avgObjSizeLabel: Utils.getFileSize(
            collStats[0].storageStats.avgObjSize,
            fractionDigits,
          ),
        });
      }
    }
    resp.dbVersion = buildInfo.version;
    return resp;
  }

  getModelMap(): Map<string, ModelMap> {
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

  getIndexMap(): Map<string, IndexSchema[]> {
    if (!Utils.isEmpty(this.indexMap)) {
      return this.indexMap;
    }
    for (const dbIndexInfo of defaultIndexes) {
      const dbName = dbIndexInfo.aliasName;
      if (this.indexMap.has(dbName)) {
        this.indexMap.get(dbName).push(dbIndexInfo);
      } else {
        this.indexMap.set(dbName, [dbIndexInfo])
      }
    }
    return this.indexMap;
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
        // 拿到某个表的全部索引信息
        const indexArray = await this.mongooseConnection
          .collection(collectionName)
          .indexInformation({ full: true });
        for (const indexInfo of indexArray) {
          if (indexInfo.name === '_id_') {
            continue;
          }
          const indexOptions = Utils.pick(indexInfo, ['unique', 'expireAfterSeconds'])
          indexesList.push({
            aliasName,
            indexName: indexInfo.name,
            indexOptions,
            indexFields: indexInfo.key,
            indexStatus: await this.getDbIndexStatus(
              aliasName,
              indexInfo.key,
              indexOptions,
            ),
          });
        }
      }
    }
    return resp;
  }

  /**
   * 该方法只能判断进来的索引是否在数据库中
   * @param aliasName
   * @param indexFields
   * @param indexOptions
   */
  async getDbIndexStatus(
    aliasName: string,
    indexFields: Record<string, any>,
    indexOptions: IndexOptions,
  ) {
    const defaultIndexMap = this.getIndexMap();
    // 取表的默认索引
    const defaultIndexArray = defaultIndexMap.get(aliasName)
    if (!defaultIndexArray) {
      return DbIndexType.Difference;
    }
    for (const dbIndexInfo of defaultIndexArray) {
      if (Utils.compareObjects(dbIndexInfo.fields, indexFields) && Utils.compareObjects(Utils.omit(dbIndexInfo.options ?? {}, 'name'), indexOptions)) {
        return DbIndexType.Normal;
      }
    }
    return DbIndexType.Difference;
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
