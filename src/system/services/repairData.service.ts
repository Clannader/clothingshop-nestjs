/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';

import { CommonResult } from '@/common/dto';
import { DatabaseService } from '@/database/services';

import { defaultIndexes } from '../defaultSystemData'
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class RepairDataService {

  @Inject()
  private readonly databaseService: DatabaseService;

  @InjectConnection()
  private readonly mongooseConnection: Connection;

  repairBaseData() {
    const resp = new CommonResult();
    return resp;
  }

  async repairDBIndex() {
    // 修复数据库全部索引
    const modelMap = this.databaseService.getModelMap();
    const resp = new CommonResult();

    for(const dbIndexInfo of defaultIndexes) {
      const modelInfo = modelMap.get(dbIndexInfo.aliasName)
      if (!modelInfo) {
        continue;
      }
      const collName = modelInfo.collectionName
      const [error, result] = await this.mongooseConnection.collection(collName).createIndex(dbIndexInfo.fields, dbIndexInfo.options)
        .then(result => [null, result]).catch(error => [error]);
    }

    return resp;
  }

  repairRightsGroup() {
    // 包括修复权限代码和默认权限组
    const resp = new CommonResult();
    return resp;
  }

  doSelfCheck() {
    // 返回自检查结果集
    const resp = new CommonResult();
    return resp;
  }
}
