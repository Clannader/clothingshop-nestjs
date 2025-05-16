/**
 * Create by oliver.wu 2024/11/27
 */
import { Inject, Injectable } from '@nestjs/common';
import { GlobalService, Utils } from '@/common/utils';
import { instanceToInstance } from 'class-transformer';

import {
  ListSystemConfigDto,
  ModifyChildrenConfigDto,
  ReqParentConfigDeleteDto,
  ReqParentConfigModifyDto,
  ReqSystemConfigListDto,
  RespSystemConfigCreateDto,
  RespSystemConfigListDto,
} from '../dto/config';

import {
  CmsSession,
  configKeyExp,
  IgnoreCaseType,
  RespErrorResult,
} from '@/common';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { ErrorPromise } from '@/common/types';

import {
  ChildrenConfigQuery,
  ParentConfig,
  ParentConfigDocument,
  ParentConfigQuery,
} from '@/entities/schema';
import {
  DeleteLogSchemaService,
  SystemConfigSchemaService,
} from '@/entities/services';
import { RightsEnum } from '@/rights';
import { UserLogsService } from '@/logs';

type CheckSystemConfig = {
  key: string;
  _id?: {
    $ne: string;
  };
};

type SearchSystemConfig = {
  key?: IgnoreCaseType;
  groupName?: IgnoreCaseType;
};

type DeleteSystemConfigWhere = {
  groupName?: string;
  _id?: {
    $in: string[];
  };
  key?: {
    $in: string[];
  };
};

@Injectable()
export class SystemConfigService {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly systemConfigSchemaService: SystemConfigSchemaService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly deleteLogSchemaService: DeleteLogSchemaService;

  async getSystemConfigList(params: ReqSystemConfigListDto) {
    const resp = new RespSystemConfigListDto();
    // 有点无语,使用get请求没办法传入boolean类型
    let includeChildren = params.includeChildren; // 这个只有查询一级配置时,如果需要二级配置才需要传true
    const configKey = params.configKey; // 一级或者二级的Key
    const groupName = params.groupName; // 查询二级配置时传入
    const where: SearchSystemConfig = {};
    if (!Utils.isEmpty(configKey)) {
      where.key = Utils.getIgnoreCase(configKey, true);
    }
    if (!Utils.isEmpty(groupName)) {
      where.groupName = Utils.getIgnoreCase(groupName, true);
      includeChildren = false;
    }
    // 默认任何参数都没有,返回所有一级Key的配置
    // 分几种情况:1.无参数 查一级, 2.没有groupName 查一级, 3.有groupName 必查二级 4.只有查一级 includeChildren才能是true
    let err: ErrorPromise, result: ParentConfigQuery | ChildrenConfigQuery;
    if (Utils.isEmpty(groupName)) {
      [err, result] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getParentConfigModel()
          .find(where, { __v: 0 })
          .sort({ _id: -1 }),
      );
    } else {
      [err, result] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getChildrenConfigModel()
          .find(where, { __v: 0 })
          .sort({ _id: -1 }),
      );
    }
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const childrenConfigMap = new Map<string, ModifyChildrenConfigDto[]>();
    if (includeChildren && result.length > 0) {
      const parentKeys: string[] = result.map((v) => v.id);
      const childrenWhere = {
        groupName: {
          $in: parentKeys,
        },
      };
      const [errChildren, childrenArray] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getChildrenConfigModel()
          .find(childrenWhere, { __v: 0 })
          .sort({ _id: -1 }),
      );
      if (errChildren) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errChildren.message;
        return resp;
      }
      for (const childRow of childrenArray) {
        const groupName = childRow.groupName;
        const configEle: ModifyChildrenConfigDto = {
          id: childRow.id,
          configKey: childRow.key,
          configValue: childRow.value,
          description: childRow.description,
          isEncrypt: childRow.isEncrypt,
          groupName: childRow.groupName,
        };
        if (childrenConfigMap.has(groupName)) {
          childrenConfigMap.get(groupName).push(configEle);
        } else {
          childrenConfigMap.set(groupName, [configEle]);
        }
      }
    }
    const systemConfigList: ListSystemConfigDto[] = [];
    for (const row of result) {
      const listSystemConfig: ListSystemConfigDto = {
        id: row.id,
        configKey: row.key,
        configValue: row.value,
        description: row.description,
        isEncrypt: row.isEncrypt,
      };
      if (includeChildren) {
        listSystemConfig.childrenConfig = childrenConfigMap.get(row.key) || [];
      }
      systemConfigList.push(listSystemConfig);
    }
    resp.configList = systemConfigList;
    resp.total = result.length;
    return resp;
  }

  async saveSystemParentConfig(
    session: CmsSession,
    params: ReqParentConfigModifyDto,
    isNew: boolean,
  ): Promise<RespSystemConfigCreateDto> {
    const resp = new RespSystemConfigCreateDto();

    const checkResp = await this.checkInfoSystemConfig(
      session,
      params,
      isNew,
      false,
    );

    if (!checkResp.isSuccess()) {
      resp.code = checkResp.code;
      resp.msg = checkResp.msg;
      return resp;
    }
    resp.id = checkResp.id;
    return resp;
  }

  /**
   * 校验系统配置数据以及保存数据
   * @param session 会话对象
   * @param params 编辑对象
   * @param isNew 是否是新建
   * @param isCheck 是否是仅检查
   */
  async checkInfoSystemConfig(
    session: CmsSession,
    params: ReqParentConfigModifyDto,
    isNew: boolean,
    isCheck: boolean,
  ) {
    const resp = new RespSystemConfigCreateDto();
    // 判断是否是新建还是编辑,如果是编辑,id必填
    const id = params.id;
    if (!isNew && Utils.isEmpty(id)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID值不能为空',
        'common.idIsEmpty',
      );
      return resp;
    }

    let oldParentConfig: ParentConfigDocument,
      newParentConfig: ParentConfigDocument,
      err: Error;
    if (!isNew) {
      // 如果是编辑,判断id值是否存在该配置
      [err, oldParentConfig] = await Utils.toPromise(
        this.systemConfigSchemaService.getParentConfigModel().findById(id),
      );
      if (err) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = err.message;
        return resp;
      }
      if (Utils.isEmpty(oldParentConfig)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '该一级配置不存在',
          'systemConfig.parentConfigNotExist',
        );
        return resp;
      }
      newParentConfig = instanceToInstance(oldParentConfig);
      if (!Utils.isEmpty(params.configKey)) {
        newParentConfig.key = params.configKey;
      } else {
        params.configKey = oldParentConfig.key;
      }
      if (!Utils.isEmpty(params.configValue)) {
        newParentConfig.value = params.configValue;
      } else {
        params.configValue = oldParentConfig.value;
      }
      // 这个写法是为了可以清空描述,从有值变成空,如果用isEmpty,则无法把描述变空值
      // 并且这里还发现如果用了isNull写法,会导致写日志那边的'null'似乎无法触发了
      if (!Utils.isNull(params.description)) {
        newParentConfig.description = params.description;
      }
    }

    if (Utils.isEmpty(params.configKey)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '配置Key不能为空',
        'systemConfig.keyIsNotEmpty',
      );
      return resp;
    }
    if (Utils.isEmpty(params.configValue)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '配置值不能为空',
        'systemConfig.valueIsNotEmpty',
      );
      return resp;
    }
    if (!configKeyExp.test(params.configKey)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '配置Key格式错误:以大写字母开头,数字、字母、下划线组合,最长10个字符',
        'systemConfig.keyFormatError',
      );
      return resp;
    }

    // 判断配置Key有没有重复
    const where: CheckSystemConfig = {
      key: params.configKey,
    };
    if (!isNew) {
      where._id = {
        $ne: params.id,
      };
    }

    const [errFind, count] = await Utils.toPromise(
      this.systemConfigSchemaService
        .getParentConfigModel()
        .countDocuments(where),
    );
    if (errFind) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = errFind.message;
      return resp;
    }
    if (count > 0) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '一级配置Key({0})已重复',
        'systemConfig.parentKeyIsExists',
        params.configKey,
      );
      return resp;
    }

    if (isCheck) {
      return resp;
    }

    if (isNew) {
      const createSystemConfigParent = {
        key: params.configKey,
        value: params.configValue,
        description: params.description,
        createUser: session.adminId,
        createDate: new Date(),
        isEncrypt: undefined,
      };
      if (params.isEncrypt) {
        createSystemConfigParent.isEncrypt = params.isEncrypt;
      }
      const [errCreate, createObj] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getParentConfigModel()
          .create(createSystemConfigParent),
      );
      if (errCreate) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errCreate.message;
        return resp;
      }
      resp.id = createObj.id;
      const content = this.globalService.serverLang(
        session,
        '新建一级配置:({0})',
        'systemConfig.createParentLog',
        createObj.key,
      );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.SystemConfig,
        content,
        createObj.id,
      );
    } else {
      newParentConfig.updateUser = session.adminId;
      newParentConfig.updateDate = new Date();
      await this.systemConfigSchemaService
        .getSystemConfigModel()
        .syncSaveDBObject(newParentConfig);
      resp.id = newParentConfig.id;
      const contentArray = [
        this.globalService.serverLang(
          session,
          '编辑一级配置:({0})',
          'systemConfig.modifyParentLog',
          newParentConfig.key,
        ),
      ];
      contentArray.push(
        ...this.globalService.compareObjectWriteLog(
          session,
          ParentConfig,
          oldParentConfig,
          newParentConfig,
        ),
      );
      if (contentArray.length > 1) {
        await this.userLogsService.writeUserLog(
          session,
          LogTypeEnum.SystemConfig,
          contentArray.join('\r\n'),
          newParentConfig.id,
        );
      }
    }

    return resp;
  }

  async deleteSystemConfig(
    session: CmsSession,
    params: ReqParentConfigDeleteDto,
  ) {
    const resp = new RespErrorResult();
    // 因为是统一删除一二级配置方法,所以逻辑如下:
    // 如果有groupName的,则认为是删除二级配置,并且判断有二级配置的新建和编辑权限
    // 没有groupName的，则认为删除一级配置,并且判断有一级配置的新建和编辑权限
    // 如果ids和keys都传入,则以ids为准
    const ids = params.ids;
    const keys = params.keys;
    const groupName = params.groupName;
    const isParent = Utils.isEmpty(groupName);

    if (Utils.arrayIsNull(ids) && Utils.arrayIsNull(keys)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = params.keys // 如果是undefined,则提示另一个
        ? this.globalService.serverLang(
            session,
            'Keys不能为空',
            'common.keysIsEmpty',
          )
        : this.globalService.serverLang(
            session,
            'Ids不能为空',
            'common.idsIsEmpty',
          );
      return resp;
    }

    // 忘记自己为什么写这个权限判断了,估计是为了测试能不能返回提示吧,笑哭
    if (
      isParent &&
      !Utils.hasOrRights(
        session,
        RightsEnum.ConfigCreate,
        RightsEnum.ConfigModify,
      )
    ) {
      resp.code = CodeEnum.NO_RIGHTS;
      resp.msg = this.globalService.serverLang(
        session,
        '用户{0}缺少所需权限{1}.',
        'common.hasNoPermissions',
        session.adminId,
        `${RightsEnum.ConfigCreate},${RightsEnum.ConfigModify}`,
      );
      return resp;
    } else if (
      !isParent &&
      !Utils.hasOrRights(
        session,
        RightsEnum.ConfigChildrenCreate,
        RightsEnum.ConfigChildrenModify,
      )
    ) {
      resp.code = CodeEnum.NO_RIGHTS;
      resp.msg = this.globalService.serverLang(
        session,
        '用户{0}缺少所需权限{1}.',
        'common.hasNoPermissions',
        session.adminId,
        `${RightsEnum.ConfigChildrenCreate},${RightsEnum.ConfigChildrenModify}`,
      );
      return resp;
    }

    let idsParams: string[];
    const deleteWhere: DeleteSystemConfigWhere = {
      groupName: groupName,
    };
    // 如果删除一级配置,需要保证自身的二级都删除完毕
    if (!Utils.arrayIsNull(ids)) {
      deleteWhere._id = {
        $in: ids,
      };
      idsParams = ids;
    } else if (!Utils.arrayIsNull(keys)) {
      deleteWhere.key = {
        $in: keys,
      };
      idsParams = keys;
    }
    let err: ErrorPromise, result: ParentConfigQuery | ChildrenConfigQuery;
    if (isParent) {
      [err, result] = await Utils.toPromise(
        this.systemConfigSchemaService.getParentConfigModel().find(deleteWhere),
      );
    } else {
      [err, result] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getChildrenConfigModel()
          .find(deleteWhere),
      );
    }
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const writeLogResult = []; // 写log时需要的配置名称
    const errResult = []; // 错误集合
    const configExistId = []; // 已经存在的配置ID
    const deleteConfigId: string[] = []; // 需要删除的配置ID
    const excludeConfigId: string[] = []; // 仅一级配置使用,查出来含有二级配置无法删除

    for (const configInfo of result) {
      if (!Utils.arrayIsNull(ids)) {
        configExistId.push(configInfo.id);
      } else if (!Utils.arrayIsNull(keys)) {
        configExistId.push(configInfo.key);
      }
    }

    if (configExistId.length !== idsParams.length) {
      // 存在 不存在的id数据
      for (const id of idsParams) {
        if (!configExistId.includes(id)) {
          errResult.push(
            `(${id}) ` +
              this.globalService.serverLang(
                session,
                '该配置不存在',
                'systemConfig.isNotExist',
              ),
          );
        }
      }
    }

    // 如果是一级配置,需要重新判断他的二级数量是否为0
    if (isParent) {
      for (const configInfo of result) {
        const countWhere = {
          groupName: configInfo.key,
        };
        const [errCount, count] = await Utils.toPromise(
          this.systemConfigSchemaService
            .getChildrenConfigModel()
            .countDocuments(countWhere),
        );
        if (errCount) {
          resp.code = CodeEnum.DB_EXEC_ERROR;
          resp.msg = errCount.message;
          return resp;
        }
        if (count > 0) {
          excludeConfigId.push(configInfo.id);
        }
      }
    }

    const modelName = isParent
      ? this.systemConfigSchemaService.getParentConfigModel().getAliasName()
      : this.systemConfigSchemaService.getChildrenConfigModel().getAliasName();

    for (const configInfo of result) {
      if (excludeConfigId.includes(configInfo.id)) {
        errResult.push(
          `(${configInfo.key}) ` +
            this.globalService.serverLang(
              session,
              '该配置还存在二级配置,无法删除',
              'systemConfig.unableDelete',
            ),
        );
        continue;
      }
      await configInfo.deleteOne();
      writeLogResult.push(configInfo.key);
      deleteConfigId.push(configInfo.id);
      await this.deleteLogSchemaService.createDeleteLog({
        modelName,
        keyWords: configInfo.key,
        searchWhere: {
          key: configInfo.key,
          ...(configInfo['groupName']
            ? { groupName: configInfo['groupName'] }
            : {}),
        },
        id: configInfo.id,
      });
    }

    if (writeLogResult.length > 0) {
      // 只要有一个删除成功就算成功
      const content = isParent
        ? this.globalService.serverLang(
            session,
            '删除一级配置:({0})',
            'systemConfig.deleteParentLog',
            writeLogResult.join(','),
          )
        : this.globalService.serverLang(
            session,
            '删除({0})下的二级配置:({1})',
            'systemConfig.deleteChildrenLog',
            groupName,
            writeLogResult.join(','),
          );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.SystemConfig,
        content,
        deleteConfigId,
      );
    } else {
      // 这里是删除全部都失败的情况
      resp.code = CodeEnum.FAIL;
    }
    if (errResult.length > 0) {
      resp.errResult = errResult;
    }
    return resp;
  }
}
