/**
 * Create by oliver.wu 2024/11/27
 */
import { Inject, Injectable } from '@nestjs/common';
import { GlobalService, Utils } from '@/common/utils';
import { instanceToInstance } from 'class-transformer';

import {
  ListSystemConfigDto,
  ModifyChildrenConfigDto,
  ReqChildrenConfigModifyDto,
  ReqParentConfigDeleteDto,
  ReqParentConfigModifyDto,
  ReqSystemConfigListDto,
  RespSystemChildrenConfigCreateDto,
  RespSystemConfigCreateDto,
  RespSystemConfigListDto,
  ReqSystemConfigSingleDto,
  RespSystemConfigSingleDto,
  InfoSystemConfigDto,
} from '../dto/config';

import {
  CmsSession,
  configKeyExp,
  IgnoreCaseType,
  RespErrorResult,
  SecurityOptions,
} from '@/common';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { ErrorPromise } from '@/common/types';

import {
  ChildrenConfig,
  ChildrenConfigDocument,
  ChildrenConfigElement,
  ChildrenConfigQuery,
  ParentConfig,
  ParentConfigDocument,
  ParentConfigElement,
  ParentConfigQuery,
  SecretSchema,
} from '@/entities/schema';
import {
  DeleteLogSchemaService,
  SystemConfigSchemaService,
} from '@/entities/services';
import { RightsEnum } from '@/rights';
import { UserLogsService } from '@/logs';
import { MemoryCacheService, SecretPem } from '@/cache/services';

type CheckSystemConfig = {
  key: string;
  groupName?: string;
  _id?: {
    $ne: string;
  };
};

type SearchSystemConfig = {
  key?: IgnoreCaseType;
  groupName?: IgnoreCaseType;
  _id?: string;
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

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

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
      const parentKeys: string[] = result.map((v) => v.key);
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
    securityOptions?: SecurityOptions,
  ): Promise<RespSystemConfigCreateDto> {
    const resp = new RespSystemConfigCreateDto();

    const checkResp = await this.checkInfoParentConfig(
      session,
      params,
      isNew,
      false,
      securityOptions,
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
   * @param securityOptions 加密参数
   */
  async checkInfoParentConfig(
    session: CmsSession,
    params: ReqParentConfigModifyDto,
    isNew: boolean,
    isCheck: boolean,
    securityOptions?: SecurityOptions,
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
      // 判断如果之前是加密存储的,编辑值的时候也需要加密
      if (!Utils.isEmpty(params.isEncrypt)) {
        newParentConfig.isEncrypt = params.isEncrypt;
      } else {
        params.isEncrypt = oldParentConfig.isEncrypt;
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

    // 新增如果加密值的话,需要判断传入的value是否能解密成功
    // 如果isEncrypt=true,那么value就必须要加密
    // 如果isEncrypt=false,那么value加不加密都无所谓

    // 判断value是否加密,用解密方法解出来成功就行??
    let secretValue: SecretSchema;
    if (params.isEncrypt) {
      if (isNew || oldParentConfig.value !== newParentConfig.value) {
        //如果是新建或者编辑时value值不一样,就要解密然后服务器加密
        const plainValue = await this.memoryCacheService.tripleDesDecrypt(
          session.language,
          params.configValue,
          securityOptions,
        );
        secretValue =
          await this.memoryCacheService.internalRsaEncrypt(plainValue);
      } else if (oldParentConfig.value === newParentConfig.value) {
        // 编辑时,value没有变化
        secretValue = oldParentConfig.secretValue;
      }
    }

    // 新增判断一级Key不能存在于二级Key中
    const checkChildrenName = {
      key: params.configKey,
    };
    const [errCheck, countChildren] = await Utils.toPromise(
      this.systemConfigSchemaService
        .getChildrenConfigModel()
        .countDocuments(checkChildrenName),
    );
    if (errCheck) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = errCheck.message;
      return resp;
    }
    if (countChildren > 0) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '无法创建已存在同名二级Key',
        'systemConfig.unableCreateChildrenName',
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
        isEncrypt: false,
        secretValue: secretValue,
      };
      if (params.isEncrypt) {
        createSystemConfigParent.isEncrypt = params.isEncrypt;
        // 加密后,原本值就变成星号
        createSystemConfigParent.value = '******';
        // 暂时没有办法用数据库的验证器校验字段类型是否合法???
        createSystemConfigParent.secretValue = secretValue;
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
      this.userLogsService
        .writeUserLog(session, LogTypeEnum.SystemConfig, content, createObj.id)
        .then();
    } else {
      newParentConfig.updateUser = session.adminId;
      newParentConfig.updateDate = new Date();
      // isEncrypt由false->true
      if (params.isEncrypt) {
        newParentConfig.value = '******';
        newParentConfig.secretValue = secretValue;
      } else {
        // isEncrypt由true->false
        newParentConfig.secretValue = undefined;
      }
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
        this.userLogsService
          .writeUserLog(
            session,
            LogTypeEnum.SystemConfig,
            contentArray.join('\r\n'),
            newParentConfig.id,
          )
          .then();
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
      !this.globalService.userHasOrRightsBoolean(
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
      !this.globalService.userHasOrRightsBoolean(
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
      this.userLogsService
        .writeUserLog(
          session,
          LogTypeEnum.SystemConfig,
          content,
          deleteConfigId,
        )
        .then();
    } else {
      // 这里是删除全部都失败的情况
      resp.code = CodeEnum.FAIL;
    }
    if (errResult.length > 0) {
      resp.errResult = errResult;
    }
    return resp;
  }

  async saveSystemChildrenConfig(
    session: CmsSession,
    params: ReqChildrenConfigModifyDto,
    isNew: boolean,
    securityOptions?: SecurityOptions,
  ): Promise<RespSystemChildrenConfigCreateDto> {
    const resp = new RespSystemChildrenConfigCreateDto();

    const checkResp = await this.checkInfoChildrenConfig(
      session,
      params,
      isNew,
      false,
      securityOptions,
    );

    if (!checkResp.isSuccess()) {
      resp.code = checkResp.code;
      resp.msg = checkResp.msg;
      return resp;
    }
    resp.id = checkResp.id;
    resp.groupName = checkResp.groupName;
    return resp;
  }

  async checkInfoChildrenConfig(
    session: CmsSession,
    params: ReqChildrenConfigModifyDto,
    isNew: boolean,
    isCheck: boolean,
    securityOptions?: SecurityOptions,
  ) {
    const resp = new RespSystemChildrenConfigCreateDto();
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

    let oldChildrenConfig: ChildrenConfigDocument,
      newChildrenConfig: ChildrenConfigDocument,
      err: Error;
    if (!isNew) {
      [err, oldChildrenConfig] = await Utils.toPromise(
        this.systemConfigSchemaService.getChildrenConfigModel().findById(id),
      );
      if (err) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = err.message;
        return resp;
      }
      if (Utils.isEmpty(oldChildrenConfig)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '该二级配置不存在',
          'systemConfig.childrenConfigNotExist',
        );
        return resp;
      }
      newChildrenConfig = instanceToInstance(oldChildrenConfig);
      params.groupName = oldChildrenConfig.groupName; // 编辑时不可修改该字段
      if (!Utils.isEmpty(params.configKey)) {
        newChildrenConfig.key = params.configKey;
      } else {
        params.configKey = oldChildrenConfig.key;
      }
      // 判断如果之前是加密存储的,编辑值的时候也需要加密
      if (!Utils.isEmpty(params.isEncrypt)) {
        newChildrenConfig.isEncrypt = params.isEncrypt;
      } else {
        params.isEncrypt = oldChildrenConfig.isEncrypt;
      }
      if (!Utils.isEmpty(params.configValue)) {
        newChildrenConfig.value = params.configValue;
      } else {
        params.configValue = oldChildrenConfig.value;
      }
      if (!Utils.isNull(params.description)) {
        newChildrenConfig.description = params.description;
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

    let secretValue: SecretSchema;
    if (params.isEncrypt) {
      if (isNew || oldChildrenConfig.value !== newChildrenConfig.value) {
        //如果是新建或者编辑时value值不一样,就要解密然后服务器加密
        const plainValue = await this.memoryCacheService.tripleDesDecrypt(
          session.language,
          params.configValue,
          securityOptions,
        );
        secretValue =
          await this.memoryCacheService.internalRsaEncrypt(plainValue);
      } else if (oldChildrenConfig.value === newChildrenConfig.value) {
        // 编辑时,value没有变化
        secretValue = oldChildrenConfig.secretValue;
      }
    }

    if (isNew) {
      // 新建二级key需要判断一级key是否存在
      if (Utils.isEmpty(params.groupName)) {
        resp.code = CodeEnum.EMPTY;
        resp.msg = this.globalService.serverLang(
          session,
          '一级组名不能为空',
          'systemConfig.groupNameIsNotEmpty',
        );
        return resp;
      }

      // 判断一级groupName必须存在
      const searchGroupName = {
        key: params.groupName,
      };
      const [errSearch, groupCount] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getParentConfigModel()
          .countDocuments(searchGroupName),
      );
      if (errSearch) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errSearch.message;
        return resp;
      }
      if (groupCount <= 0) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '一级组名不存在',
          'systemConfig.parentGroupNotExists',
        );
        return resp;
      }
    }

    // 判断二级key是否在全部的一级key中存在
    const checkParentName = {
      key: params.configKey,
    };
    const [errCheck, countParent] = await Utils.toPromise(
      this.systemConfigSchemaService
        .getParentConfigModel()
        .countDocuments(checkParentName),
    );
    if (errCheck) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = errCheck.message;
      return resp;
    }
    if (countParent > 0) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '无法创建已存在同名一级Key',
        'systemConfig.unableCreateParentName',
      );
      return resp;
    }

    // 判断二级key在自己的一级key中是否存在
    const where: CheckSystemConfig = {
      key: params.configKey,
      groupName: params.groupName,
    };
    if (!isNew) {
      where._id = {
        $ne: params.id,
      };
    }
    const [errFind, count] = await Utils.toPromise(
      this.systemConfigSchemaService
        .getChildrenConfigModel()
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
        '({0})下的二级配置:({1})已重复',
        'systemConfig.childrenKeyIsExists',
        params.groupName,
        params.configKey,
      );
      return resp;
    }
    if (isCheck) {
      return resp;
    }

    if (isNew) {
      const createChildrenConfig = {
        key: params.configKey,
        value: params.configValue,
        groupName: params.groupName,
        description: params.description,
        createUser: session.adminId,
        createDate: new Date(),
        isEncrypt: false,
        secretValue: secretValue,
      };
      if (params.isEncrypt) {
        createChildrenConfig.isEncrypt = params.isEncrypt;
        createChildrenConfig.value = '******';
        createChildrenConfig.secretValue = secretValue;
      }
      const [errCreate, createObj] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getChildrenConfigModel()
          .create(createChildrenConfig),
      );
      if (errCreate) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errCreate.message;
        return resp;
      }
      resp.id = createObj.id;
      const content = this.globalService.serverLang(
        session,
        '新建({0})下的二级配置:({1})',
        'systemConfig.createChildrenLog',
        createObj.groupName,
        createObj.key,
      );
      this.userLogsService
        .writeUserLog(session, LogTypeEnum.SystemConfig, content, createObj.id)
        .then();
    } else {
      newChildrenConfig.updateUser = session.adminId;
      newChildrenConfig.updateDate = new Date();
      if (params.isEncrypt) {
        newChildrenConfig.value = '******';
        newChildrenConfig.secretValue = secretValue;
      } else {
        newChildrenConfig.secretValue = undefined;
      }
      await this.systemConfigSchemaService
        .getSystemConfigModel()
        .syncSaveDBObject(newChildrenConfig);
      resp.id = newChildrenConfig.id;
      const contentArray = [
        this.globalService.serverLang(
          session,
          '编辑({0})下的二级配置:({1})',
          'systemConfig.modifyChildrenLog',
          newChildrenConfig.groupName,
          newChildrenConfig.key,
        ),
      ];
      contentArray.push(
        ...this.globalService.compareObjectWriteLog(
          session,
          ChildrenConfig,
          oldChildrenConfig,
          newChildrenConfig,
        ),
      );
      if (contentArray.length > 1) {
        this.userLogsService
          .writeUserLog(
            session,
            LogTypeEnum.SystemConfig,
            contentArray.join('\r\n'),
            newChildrenConfig.id,
          )
          .then();
      }
    }

    return resp;
  }

  async getSystemConfigInfo(
    session: CmsSession,
    params: ReqSystemConfigSingleDto,
    securityOptions: SecurityOptions = {},
  ) {
    const resp = new RespSystemConfigSingleDto();
    const id = params.id;
    const configKey = params.configKey;
    const groupName = params.groupName;

    const where: SearchSystemConfig = {};

    if (!Utils.isEmpty(configKey)) {
      where.key = Utils.getIgnoreCase(configKey, true);
    }
    if (!Utils.isEmpty(groupName)) {
      where.groupName = Utils.getIgnoreCase(groupName, true);
    }
    if (!Utils.isEmpty(id)) {
      where._id = id;
    }

    if (Utils.isEmpty(configKey) && Utils.isEmpty(id)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID和configKey必填其一',
        'systemConfig.whereIsNotEmpty',
      );
      return resp;
    }

    let err: ErrorPromise, result: ParentConfigElement | ChildrenConfigElement;
    if (Utils.isEmpty(groupName)) {
      [err, result] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getParentConfigModel()
          .findOne(where, { __v: 0 }),
      );
    } else {
      [err, result] = await Utils.toPromise(
        this.systemConfigSchemaService
          .getChildrenConfigModel()
          .findOne(where, { __v: 0 }),
      );
    }
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    if (Utils.isEmpty(result)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '该配置不存在',
        'systemConfig.configNotExist',
      );
      return resp;
    }

    const configInfo = new InfoSystemConfigDto();
    configInfo.id = result.id;
    configInfo.configKey = result.key;
    configInfo.configValue = result.value;
    configInfo.groupName = (result as ChildrenConfigElement)?.groupName;
    configInfo.isEncrypt = result.isEncrypt;
    configInfo.description = result.description;
    configInfo.createUser = result.createUser;
    configInfo.createDate = result.createDate;
    configInfo.updateUser = result.updateUser;
    configInfo.updateDate = result.updateDate;

    if (result.isEncrypt && Object.keys(securityOptions).length !== 0) {
      const secretValue: SecretSchema = result.secretValue;
      const secretPem = await this.memoryCacheService.getInternalRsaPem(
        secretValue.secretId,
      );
      const plainData = Utils.rsaPrivateDecrypt(
        secretValue.secretText,
        secretPem.privatePem,
      );
      configInfo.configValue = await this.memoryCacheService.tripleDesEncrypt(
        session.language,
        plainData,
        securityOptions,
      );
    }

    resp.code = CodeEnum.SUCCESS;
    resp.configInfo = configInfo;
    return resp;
  }
}
