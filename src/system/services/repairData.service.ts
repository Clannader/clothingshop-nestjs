/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { CommonResult } from '@/common/dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { GlobalService, Utils } from '@/common/utils';
import { CmsSession } from '@/common';

import { DatabaseService } from '@/database/services';
import { RightsCodesSchemaService } from '@/entities/services';
import { RightCodeDocument } from '@/entities/schema';

import { defaultIndexes } from '../defaultSystemData';
import { RightsList } from '@/rights';
import { UserLogsService } from '@/logs';
import type { RightsProp, RightsConfig } from '@/rights';

@Injectable()
export class RepairDataService {
  @Inject()
  private readonly databaseService: DatabaseService;

  @InjectConnection()
  private readonly mongooseConnection: Connection;

  @Inject()
  private readonly rightCodeSchemaService: RightsCodesSchemaService;

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
    this.userLogsService
      .writeUserLog(
        session,
        LogTypeEnum.RepairData,
        this.globalService.serverLang(
          session,
          '修复默认数据库索引',
          'repairData.defaultDBIndex',
        ),
      )
      .then();
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

    const defaultRightsArray = this.getRightsCodeArray(RightsList);
    // 1.先查询数据库中的数据
    const [err, dbRightsCodeList] = await Utils.toPromise(
      this.rightCodeSchemaService.getModel().find(),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    // 这里要对比3种数据出来,数据库没有的插入,数据库有的合并,数据库多余的删掉
    const defaultRightsCodeMap = new Map<string, RightsProp>();
    defaultRightsArray.forEach((item) => {
      defaultRightsCodeMap.set(item.code, item);
    });
    const dbRightsCodeMap = new Map<string, RightCodeDocument>();
    dbRightsCodeList.forEach((item) => {
      dbRightsCodeMap.set(item.code, item);
    });

    // 相同的数据做合并
    // const mergeRightsCodeArray = defaultRightsArray.filter((item) => dbRightsCodeSet.has(item.code))

    // 默认代码有,数据库没有的插入
    const insertRightsCodeArray = defaultRightsArray.filter(
      (item) => !dbRightsCodeMap.has(item.code),
    );
    // 并行执行用 Promise.all + map
    await Promise.all(
      insertRightsCodeArray.map((item) => {
        const rightCodeInfo = {
          code: item.code,
          key: item.key,
          description: item.desc,
          category: item.category,
          path: item.path,
          cnLabel: item.desc,
          enLabel: this.globalService.lang(
            'EN',
            item.desc,
            `repairData.${item.key}`,
          ),
        };
        this.rightCodeSchemaService
          .getModel()
          .create(rightCodeInfo)
          .then(() => {
            this.userLogsService
              .writeUserLog(
                session,
                LogTypeEnum.RepairData,
                this.globalService.serverLang(
                  session,
                  '修复新增权限代码({0})',
                  'repairData.addRightsCode',
                  item.code,
                ),
              )
              .then();
          });
      }),
    );

    // 默认没有,数据库有的删除
    const deleteRightsCodeArray = dbRightsCodeList.filter(
      (item) => !defaultRightsCodeMap.has(item.code),
    );
    deleteRightsCodeArray.forEach((item) => {
      item.deleteOne().then(() => {
        this.userLogsService
          .writeUserLog(
            session,
            LogTypeEnum.RepairData,
            this.globalService.serverLang(
              session,
              '修复删除废弃权限代码({0})',
              'repairData.deleteRightsCode',
              item.code,
            ),
          )
          .then();
      });
    });

    this.userLogsService
      .writeUserLog(
        session,
        LogTypeEnum.RepairData,
        this.globalService.serverLang(
          session,
          '修复完成默认权限代码',
          'repairData.defaultRightCode',
        ),
      )
      .then();
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
