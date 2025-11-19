/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { CommonResult } from '@/common/dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum, LogTypeEnum } from '@/common/enum';

import { DatabaseService } from '@/database/services';
import { RightCodeSchemaService } from '@/entities/services';

import { defaultIndexes } from '../defaultSystemData';
import { RightsList } from '@/rights';
import { UserLogsService } from '@/logs';

import type { RightsProp, RightsConfig } from '@/rights';
import { CmsSession } from '@/common';
import { GlobalService } from '@/common/utils';

@Injectable()
export class RepairDataService {
  @Inject()
  private readonly databaseService: DatabaseService;

  @InjectConnection()
  private readonly mongooseConnection: Connection;

  @Inject()
  private readonly rightCodeSchemaService: RightCodeSchemaService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly globalService: GlobalService;

  repairBaseData() {
    const resp = new CommonResult();
    return resp;
  }

  async repairDBIndex(session: CmsSession) {
    // 修复数据库全部索引
    const modelMap = this.databaseService.getModelMap();
    const resp = new CommonResult();
    await this.userLogsService.writeUserLog(
      session,
      LogTypeEnum.RepairData,
      this.globalService.serverLang(
        session,
        '修复默认数据库索引',
        'repairData.defaultDBIndex',
      ),
    );
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

  async repairRightsGroup(session: CmsSession) {
    // 包括修复权限代码和默认权限组
    const resp = new CommonResult();
    const rightsArray = this.getRightsCodeArray(RightsList);
    // TODO 以后先从数据库查出来,对比有差异再去merge到数据库中???
    // 不然多次merge也没有意义
    // 每一次merge都记录日志修改了哪个权限
    // 如果是默认的code没有了,则需要删除废弃的权限代码,然后写日志,删除权限xxx
    for (const rightInfo of rightsArray) {
      const rightCodeInfo = {
        code: rightInfo.code,
        key: rightInfo.key,
        description: rightInfo.desc,
        category: rightInfo.category,
        path: rightInfo.path,
        cnLabel: rightInfo.desc,
        enLabel: this.globalService.lang(
          'EN',
          rightInfo.desc,
          `repairData.${rightInfo.key}`,
        ),
      };
      await this.rightCodeSchemaService.mergeRightCode(rightCodeInfo);
    }
    await this.userLogsService.writeUserLog(
      session,
      LogTypeEnum.RepairData,
      this.globalService.serverLang(
        session,
        '修复默认权限代码',
        'repairData.defaultRightCode',
      ),
    );
    return resp;
  }

  private getRightsCodeArray(
    defaultRights: RightsConfig,
    category?: string,
    path?: string,
  ) {
    const rightsList: RightsProp[] = [];
    for (const rightsKey in defaultRights) {
      const rightInfo = defaultRights[rightsKey];
      rightsList.push({
        code: rightInfo.code,
        desc: rightInfo.desc,
        key: rightsKey,
        ...(category ? { category } : {}), // 如果category有值则加入该字段,如果没值则不存在该字段
        ...(path ? { path: `${path}.${rightsKey}` } : {}),
      });
      if (rightInfo.children) {
        rightsList.push(
          ...this.getRightsCodeArray(
            rightInfo.children,
            rightsKey,
            path ? `${path}.${rightsKey}` : `${rightsKey}`,
          ),
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
