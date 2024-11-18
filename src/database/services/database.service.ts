/**
 * Create by oliver.wu 2024/9/20
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Collection, Connection, Model } from 'mongoose';

import { GlobalService, Utils } from '@/common/utils';
import { CommonResult } from '@/common/dto';
import {
  DbIndexesDto,
  DbStatisticsDto,
  ReqDbStatisticsDto,
  RespCollectionsNameDto,
  RespDbIndexesListDto,
  RespDbStatisticsDto,
} from '../dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum, DbIndexType } from '@/common/enum';

import { defaultIndexes } from '@/system/defaultSystemData';
import type { IndexOptions, IndexSchema } from '@/system/defaultSystemData';
import { CmsSession } from '@/common';

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

  async getDbStatistics(session: CmsSession, params: ReqDbStatisticsDto) {
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
          session,
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
    // 最近发现其实model和数据库表名其实是不对等的,所以表名的集合还是以collections为准
    // console.log(this.mongooseConnection.modelNames())
    // 由于使用了数据库的鉴别器后,可以把同一个表名的数据拆成多个model
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

    // 构建默认索引Map
    const defaultIndexMap = new Map<string, IndexSchema[]>();
    for (const dbIndexInfo of defaultIndexes) {
      const dbName = dbIndexInfo.aliasName;
      const indexNameArray = [];
      for (const key in dbIndexInfo.fields) {
        indexNameArray.push(key);
        indexNameArray.push(dbIndexInfo.fields[key]);
      }
      dbIndexInfo.indexName = indexNameArray.join('_');
      dbIndexInfo.indexStatus = DbIndexType.Exception;
      if (defaultIndexMap.has(dbName)) {
        defaultIndexMap.get(dbName).push(dbIndexInfo);
      } else {
        defaultIndexMap.set(dbName, [dbIndexInfo]);
      }
    }

    // 构造一个Map,<aliasName, {modelName, collectionName}>
    const modelMap = this.getModelMap();
    // 遍历有效的数据库名

    for (const [dbName, defaultIndexInfo] of defaultIndexMap) {
      // 减少查询数据库
      if (!aliasNames.includes(dbName)) {
        continue;
      }
      // 因为循环的是默认索引,所以dbName肯定是正确的
      const collectionName = modelMap.get(dbName).collectionName;
      // 拿到某个表的全部索引信息
      const indexArray = await this.mongooseConnection
        .collection(collectionName)
        .indexInformation({ full: true });
      for (const indexInfo of indexArray) {
        if (indexInfo.name === '_id_') {
          continue;
        }
        const indexOptions: IndexOptions = Utils.pick(indexInfo, [
          'unique',
          'expireAfterSeconds',
        ]);
        const respIndexSchema: IndexSchema = {
          aliasName: dbName,
          indexName: indexInfo.name,
          options: indexOptions,
          fields: indexInfo.key,
          indexStatus: DbIndexType.Difference,
        };
        // TODO 后期看看索引的有效期不一致时,是否返回索引差异
        for (const defaultIndex of defaultIndexInfo) {
          // 这里需要注意的是建立索引的字段排序有可能不同,但代码可能判断是一样的
          // 这里的判断字段是否相同是无序的,也就是说{a:1, b:1}和{b:1, a:1}代码判断是一样的
          // 但是实际上索引的效果是不一样的,这个有点无法避免,那么能否判断索引的名字是否相同(索引默认名是按照字段的顺序起的)? 不可取,因为建立索引时可以另取名字
          if (
            Utils.compareObjects(defaultIndex.fields, indexInfo.key) &&
            Utils.compareObjects(
              Utils.omit(defaultIndex.options ?? {}, 'name'),
              indexOptions,
            )
          ) {
            respIndexSchema.indexStatus = DbIndexType.Normal; // 改变值跳出循环判断用
            defaultIndex.indexStatus = DbIndexType.Normal; // 修改内存变量值
            break;
          }
        }
        if (respIndexSchema.indexStatus === DbIndexType.Difference) {
          defaultIndexInfo.push(respIndexSchema);
        }
      }
      for (const indexInfo of defaultIndexInfo) {
        indexesList.push({
          aliasName: dbName,
          indexName: indexInfo.indexName,
          indexOptions: indexInfo.options,
          indexFields: indexInfo.fields,
          indexStatus: indexInfo.indexStatus,
        });
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
