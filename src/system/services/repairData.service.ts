/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { instanceToInstance } from 'class-transformer';

import { CommonResult } from '@/common/dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { GlobalService, Utils } from '@/common/utils';
import { CmsSession } from '@/common';

import { DatabaseService } from '@/database/services';
import {
  DeleteLogSchemaService,
  RightsCodeSchemaService,
  RightsGroupSchemaService,
} from '@/entities/services';
import {
  RightsCodeDocument,
  RightsCode,
  RightsGroupDocument,
  RightsGroup,
} from '@/entities/schema';

import { defaultIndexes } from '../defaultSystemData';
import { RightsList, RightsGroupList } from '@/rights';
import { UserLogsService } from '@/logs';
import type { RightsProp, RightsConfig, RightsGroupType } from '@/rights';

@Injectable()
export class RepairDataService {
  @Inject()
  private readonly databaseService: DatabaseService;

  @InjectConnection()
  private readonly mongooseConnection: Connection;

  @Inject()
  private readonly rightsCodeSchemaService: RightsCodeSchemaService;

  @Inject()
  private readonly rightsGroupSchemaService: RightsGroupSchemaService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly deleteLogSchemaService: DeleteLogSchemaService;

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
      // TODO 这里这样写会导致前面修复成功,有一个修复失败则会返回提示失败,但是前面修复过的已经成功无法回退了
      //  再次修复时还是会遇到这个错误的索引导致停止,无法修复之后可能会成功的索引
      // 方案1：使用事务
      // 方案2：使用Promise的并发,忽略错误
      if (error) {
        throw new CodeException(CodeEnum.DB_EXEC_ERROR, error.message);
      }
    }

    return resp;
  }

  async repairRightsCode(session: CmsSession) {
    // 修复权限代码
    const resp = new CommonResult();

    const defaultRightsArray = this.getRightsCodeArray(RightsList);
    // 1.先查询数据库中的数据
    const [err, dbRightsCodeList] = await Utils.toPromise(
      this.rightsCodeSchemaService.getModel().find(),
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
    const dbRightsCodeMap = new Map<string, RightsCodeDocument>();
    dbRightsCodeList.forEach((item) => {
      dbRightsCodeMap.set(item.code, item);
    });
    const totalOperationId = [];
    // 相同的数据做合并
    const mergeRightsCodeArray = defaultRightsArray.filter((item) =>
      dbRightsCodeMap.has(item.code),
    );
    // 基本上以后多次点修复,都是做合并的操作了
    for (const item of mergeRightsCodeArray) {
      const oldRightsCode = dbRightsCodeMap.get(item.code);
      const newRightsCode = instanceToInstance(oldRightsCode);

      // const defaultRightsCode = defaultRightsCodeMap.get(item.code);
      newRightsCode.key = item.key;
      newRightsCode.description = item.desc;
      if (newRightsCode.category) {
        newRightsCode.category = item.category;
      }
      if (item.path) {
        newRightsCode.path = item.path;
      }
      newRightsCode.cnLabel = item.desc;
      newRightsCode.enLabel = this.globalService.lang(
        'EN',
        item.desc,
        `repairData.${item.key}`,
      );

      const mergeLogContent = [
        this.globalService.serverLang(
          session,
          '修复合并权限代码({0})',
          'repairData.mergeRightsCode',
          item.code,
        ),
      ];
      mergeLogContent.push(
        ...this.globalService.compareObjectWriteLog(
          session,
          RightsCode,
          oldRightsCode,
          newRightsCode,
        ),
      );
      if (mergeLogContent.length > 1) {
        await newRightsCode.save();
        await this.userLogsService.writeUserLog(
          session,
          LogTypeEnum.RepairData,
          mergeLogContent.join('\r\n'),
          newRightsCode.id,
        );
        totalOperationId.push(newRightsCode.id);
      }
    }

    // 默认代码有,数据库没有的插入
    const insertRightsCodeArray = defaultRightsArray.filter(
      (item) => !dbRightsCodeMap.has(item.code),
    );
    // 并行执行用 Promise.all + map
    // 使用事务,避免创建失败可以回滚记录
    if (insertRightsCodeArray.length > 0) {
      const dbSession = await this.mongooseConnection.startSession();
      const insertRightsCodeId = [];
      try {
        dbSession.startTransaction(); // 开始事务
        for (const item of insertRightsCodeArray) {
          const rightsCodeInfo = {
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
          const [, insertResult] = await Utils.toPromise(
            this.rightsCodeSchemaService
              .getModel()
              .insertOne(rightsCodeInfo, { session: dbSession }),
          );
          await this.userLogsService.writeUserLog(
            session,
            LogTypeEnum.RepairData,
            this.globalService.serverLang(
              session,
              '修复新增权限代码({0})',
              'repairData.addRightsCode',
              item.code,
            ),
            insertResult.id,
            { session: dbSession },
          );
          insertRightsCodeId.push(insertResult.id);
        }
        await dbSession.commitTransaction();
      } catch (error) {
        // 手动回滚事务
        insertRightsCodeId.length = 0; // 清空数组
        await dbSession.abortTransaction();
      } finally {
        totalOperationId.push(...insertRightsCodeId);
        await dbSession.endSession();
      }
    }

    // 默认没有,数据库有的删除
    // 这里的权限代码删除估计还需要判断使用有权限组或者用户使用
    const deleteRightsCodeArray = dbRightsCodeList.filter(
      (item) => !defaultRightsCodeMap.has(item.code),
    );
    const deleteRightsCodeId = [];
    const writeLogCodes = [];
    const rightsCodesModelName = this.rightsCodeSchemaService
      .getModel()
      .getAliasName();
    for (const item of deleteRightsCodeArray) {
      deleteRightsCodeId.push(item.id);
      totalOperationId.push(item.id);
      writeLogCodes.push(item.code);
      await item.deleteOne();
      await this.deleteLogSchemaService.createDeleteLog({
        modelName: rightsCodesModelName,
        keyWords: item.code,
        searchWhere: {
          code: item.code,
        },
        id: item.id,
      });
    }
    for (const code of writeLogCodes) {
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.RepairData,
        this.globalService.serverLang(
          session,
          '修复删除废弃权限代码({0})',
          'repairData.deleteRightsCode',
          code,
        ),
        deleteRightsCodeId,
      );
    }

    // 修复完成
    await this.userLogsService.writeUserLog(
      session,
      LogTypeEnum.RepairData,
      this.globalService.serverLang(
        session,
        '修复完成默认权限代码',
        'repairData.defaultRightsCode',
      ),
      totalOperationId,
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

  async repairRightsGroup(session: CmsSession) {
    // 修复权限组代码
    const resp = new CommonResult();
    // 1.先查询数据库中的数据
    const groupWhere = {
      shopId: Utils.SYSTEM,
    };
    const [errGroup, dbRightsGroupList] = await Utils.toPromise(
      this.rightsGroupSchemaService.getModel().find(groupWhere),
    );
    if (errGroup) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = errGroup.message;
      return resp;
    }
    const defaultRightsGroupMap = new Map<string, RightsGroupType>();
    RightsGroupList.forEach((item) => {
      defaultRightsGroupMap.set(item.groupCode, item);
    });
    const dbRightsGroupMap = new Map<string, RightsGroupDocument>();
    dbRightsGroupList.forEach((item) => {
      dbRightsGroupMap.set(item.groupCode, item);
    });
    const totalOperationId = [];
    const mergeRightsGroupArray = RightsGroupList.filter((item) =>
      dbRightsGroupMap.has(item.groupCode),
    );
    for (const item of mergeRightsGroupArray) {
      const oldRightsGroup = dbRightsGroupMap.get(item.groupCode);
      const newRightsGroup = instanceToInstance(oldRightsGroup);

      newRightsGroup.groupCode = item.groupCode;
      newRightsGroup.groupName = item.groupName;
      newRightsGroup.rightCodes = item.rightCodes;

      const mergeLogContent = [
        this.globalService.serverLang(
          session,
          '修复合并权限组({0})',
          'repairData.mergeRightsGroup',
          item.groupCode,
        ),
      ];
      mergeLogContent.push(
        ...this.globalService.compareObjectWriteLog(
          session,
          RightsGroup,
          oldRightsGroup,
          newRightsGroup,
        ),
      );
      if (mergeLogContent.length > 1) {
        newRightsGroup.updateUser = session.adminId;
        newRightsGroup.updateDate = new Date();
        await newRightsGroup.save();
        await this.userLogsService.writeUserLog(
          session,
          LogTypeEnum.RepairData,
          mergeLogContent.join('\r\n'),
          newRightsGroup.id,
        );
        totalOperationId.push(newRightsGroup.id);
      }
    }

    const insertRightsGroupArray = RightsGroupList.filter(
      (item) => !dbRightsGroupMap.has(item.groupCode),
    );
    if (insertRightsGroupArray.length > 0) {
      const dbSession = await this.mongooseConnection.startSession();
      const insertRightsGroupId = [];
      try {
        dbSession.startTransaction(); // 开始事务
        for (const item of insertRightsGroupArray) {
          const rightsGroupInfo = {
            groupCode: item.groupCode,
            groupName: item.groupName,
            rightCodes: item.rightCodes,
            createUser: session.adminId,
            createDate: new Date(),
          };
          const [, insertResult] = await Utils.toPromise(
            this.rightsGroupSchemaService
              .getModel()
              .insertOne(rightsGroupInfo, { session: dbSession }),
          );
          await this.userLogsService.writeUserLog(
            session,
            LogTypeEnum.RepairData,
            this.globalService.serverLang(
              session,
              '修复新增权限组({0})',
              'repairData.addRightsGroup',
              item.groupCode,
            ),
            insertResult.id,
            { session: dbSession },
          );
          insertRightsGroupId.push(insertResult.id);
        }
        await dbSession.commitTransaction();
      } catch (error) {
        // 手动回滚事务
        insertRightsGroupId.length = 0; // 清空数组
        await dbSession.abortTransaction();
      } finally {
        totalOperationId.push(...insertRightsGroupId);
        await dbSession.endSession();
      }
    }

    // 删除默认权限组的逻辑待定,因为有可能有用户使用,这样是不能删除的
    // 所以可能基本不可能删除

    // 修复完成
    await this.userLogsService.writeUserLog(
      session,
      LogTypeEnum.RepairData,
      this.globalService.serverLang(
        session,
        '修复完成默认权限组',
        'repairData.defaultRightsGroup',
      ),
      totalOperationId,
    );
    return resp;
  }

  doSelfCheck() {
    // 返回自检查结果集
    const resp = new CommonResult();

    // 检查索引是否修复完成,检查默认索引是否在数据库中即可,注意表不存在时需要忽略
    return resp;
  }
}
