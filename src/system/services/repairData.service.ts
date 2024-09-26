/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { CommonResult } from '@/common/dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';

import { DatabaseService } from '@/database/services';
import { RightCodeSchemaService } from '@/entities/services';

import { defaultIndexes } from '../defaultSystemData';
import { RightsList } from '@/rights';

import type { RightsProp, RightsConfig } from '@/rights';

@Injectable()
export class RepairDataService {
  @Inject()
  private readonly databaseService: DatabaseService;

  @InjectConnection()
  private readonly mongooseConnection: Connection;

  @Inject()
  private readonly rightCodeSchemaService: RightCodeSchemaService;

  repairBaseData() {
    const resp = new CommonResult();
    return resp;
  }

  async repairDBIndex() {
    // 修复数据库全部索引
    const modelMap = this.databaseService.getModelMap();
    const resp = new CommonResult();

    for (const dbIndexInfo of defaultIndexes) {
      const modelInfo = modelMap.get(dbIndexInfo.aliasName);
      if (!modelInfo) {
        continue;
      }
      const collName = modelInfo.collectionName;
      // 这里发现就算有重复的索引也可以修复生成,并且不会报错
      // 所以不需要任何错误和结果了
      const [error] = await this.mongooseConnection
        .collection(collName)
        .createIndex(dbIndexInfo.fields, dbIndexInfo.options)
        .then((result) => [null, result])
        .catch((error) => [error]);
      if (error) {
        throw new CodeException(CodeEnum.DB_EXEC_ERROR, error.message);
      }
    }

    return resp;
  }

  async repairRightsGroup() {
    // 包括修复权限代码和默认权限组
    const resp = new CommonResult();
    const rightsArray = this.getRightsCodeArray(RightsList);
    for (const rightInfo of rightsArray) {
      const rightCodeInfo = {
        code: rightInfo.code,
        key: rightInfo.key,
        description: rightInfo.desc,
        category: rightInfo.category,
        cnLabel: rightInfo.desc,
        enLabel: '',
      };
      await this.rightCodeSchemaService.createRightCode(rightCodeInfo);
    }
    // 写一下修复权限代码的逻辑,如果数据库没有则插入,插入时写日志插入什么权限代码
    // 如果有,考虑是否需要修复某些字段
    // 数据库多出来的,考虑删除,需要写日志
    return resp;
  }

  private getRightsCodeArray(defaultRights: RightsConfig, category?: string) {
    const rightsList: RightsProp[] = [];
    for (const rightsKey in defaultRights) {
      const rightInfo = defaultRights[rightsKey];
      rightsList.push({
        code: rightInfo.code,
        desc: rightInfo.desc,
        key: rightsKey,
        ...(category ? { category } : {}), // 如果category有值则加入该字段,如果没值则不存在该字段
      });
      if (rightInfo.children) {
        rightsList.push(
          ...this.getRightsCodeArray(rightInfo.children, rightsKey),
        );
      }
    }
    return rightsList;
  }

  doSelfCheck() {
    // 返回自检查结果集
    const resp = new CommonResult();

    // 检查索引是否修复完成,检查默认索引是否在数据库中即可,注意表不存在时需要忽略
    return resp;
  }
}
