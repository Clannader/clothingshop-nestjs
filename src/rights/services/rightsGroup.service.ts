/**
 * Create by oliver.wu 2025/12/4
 */
import { Inject, Injectable } from '@nestjs/common';
import {
  CmsSession,
  DeleteResultDto,
  groupCodeExp,
  RespErrorResult,
  RespModifyDataDto,
  singleGroupExp,
} from '@/common';
import { GlobalService, Utils } from '@/common/utils';
import { instanceToInstance } from 'class-transformer';

import { UserLogsService } from '@/logs';
import {
  DeleteLogSchemaService,
  RightsGroupSchemaService,
} from '@/entities/services';
import { RightsGroup, RightsGroupDocument } from '@/entities/schema';

import {
  ReqRightsGroupModifyDto,
  ReqRightsGroupSearchDto,
  RespRightsGroupSearchDto,
  ReqRightsGroupSingleDto,
  RespRightsGroupSingleDto,
  ListRightsGroupDto,
} from '../dto';
import { CodeEnum, LogTypeEnum } from '@/common/enum';

@Injectable()
export class RightsGroupService {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly rightsGroupSchemaService: RightsGroupSchemaService;

  @Inject()
  private readonly deleteLogSchemaService: DeleteLogSchemaService;

  getRightsGroupList(session: CmsSession, params: ReqRightsGroupSearchDto) {
    const resp = new RespRightsGroupSearchDto();
    // 考虑是否分页
    // 考虑是否在数据库中加入默认权限组标识
    // 分页第一页把默认权限组放第一页
    return resp;
  }

  async saveRightsGroup(
    session: CmsSession,
    params: ReqRightsGroupModifyDto,
    isNew: boolean,
  ) {
    const resp = new RespModifyDataDto();

    const checkResp = await this.checkRightsGroup(
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

  async checkRightsGroup(
    session: CmsSession,
    params: ReqRightsGroupModifyDto,
    isNew: boolean,
    isCheck: boolean,
  ) {
    const resp = new RespModifyDataDto();
    const id = params.id;
    if (!isNew && Utils.isEmpty(params.id)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID值不能为空',
        'common.idIsEmpty',
      );
      return resp;
    }
    let oldRightsGroup: RightsGroupDocument,
      newRightsGroup: RightsGroupDocument,
      err: Error;
    if (!isNew) {
      [err, oldRightsGroup] = await Utils.toPromise(
        this.rightsGroupSchemaService.getModel().findById(id),
      );
      if (err) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = err.message;
        return resp;
      }
      if (Utils.isEmpty(oldRightsGroup)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '该权限组不存在',
          'rightsGroup.isNotExist',
        );
        return resp;
      }
      newRightsGroup = instanceToInstance(oldRightsGroup);
      if (!Utils.isEmpty(params.groupName)) {
        newRightsGroup.groupName = params.groupName;
      } else {
        params.groupName = oldRightsGroup.groupName;
      }

      if (!Utils.isEmpty(params.groupCode)) {
        newRightsGroup.groupCode = params.groupCode;
      } else {
        params.groupCode = oldRightsGroup.groupCode;
      }

      if (!Utils.isEmpty(params.rightCodes)) {
        newRightsGroup.rightCodes = params.rightCodes;
      } else {
        params.rightCodes = oldRightsGroup.rightCodes;
      }
    }

    const paramsGroupCode = params.groupCode;
    const paramsGroupName = params.groupName;
    const paramsRightCodes = params.rightCodes;
    const paramsShopId = params.shopId;

    // TODO 这里需要判断登录用户是否是超级管理员
    //  1.如果是超级管理员,不@shopId登录的,则shopId = SYSTEM
    //  2.只要是@登录的,默认使用@的shopId
    //  3.如果不是超级管理员,如果是单shopId,有权限新建则用当前shopId
    //  4.不是超级管理员,多shopId登录的,可以选择shopId
    //  shopId字段判断逻辑未做

    if (Utils.isEmpty(paramsGroupCode)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '权限组名不能为空',
        'rightsGroup.groupCodeIsNotEmpty',
      );
      return resp;
    }
    if (Utils.isEmpty(paramsRightCodes)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '权限代码不能为空',
        'rightsGroup.rightCodesIsNotEmpty',
      );
      return resp;
    }
    if (!groupCodeExp.test(paramsGroupCode)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '权限组名格式错误',
        'rightsGroup.groupCodeFormatError',
      );
      return resp;
    }
    for (const code of paramsRightCodes) {
      if (!singleGroupExp.test(code)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '权限代码格式错误',
          'rightsGroup.rightCodesFormatError',
        );
        return resp;
      }
    }

    // 1.判断组名不能为默认组名
    const defaultGroupMap =
      this.rightsGroupSchemaService.getDefaultRightsGroup();
    const defaultKeys = defaultGroupMap.keys();
    const defaultAllCode = this.rightsGroupSchemaService.getAllRightsCode();
    if (Array.from(defaultKeys).includes(paramsGroupCode)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '权限组名不能为默认组名',
        'rightsGroup.groupCodeIsDefault',
      );
      return resp;
    }
    // 2.判断权限代码只能是默认代码中的一个
    for (const code of paramsRightCodes) {
      if (!defaultAllCode.includes(code)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '非法权限代码:({0})',
          'rightsGroup.rightCodesIsInvalid',
          code,
        );
        return resp;
      }
    }
    // 3.判断不能新建非自身权限代码
    if (
      !this.globalService.userHasRightsBoolean(session, ...paramsRightCodes)
    ) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '设置权限越权',
        'rightsGroup.limitPermission',
      );
      return resp;
    }

    const where = {
      groupCode: paramsGroupCode,
    };
    if (!isNew) {
      where['_id'] = {
        $ne: id,
      };
    }
    const [errFind, count] = await Utils.toPromise(
      this.rightsGroupSchemaService.getModel().countDocuments(where),
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
        '权限组({0})已存在',
        'rightsGroup.groupCodeIsExists',
        paramsGroupCode,
      );
      return resp;
    }

    if (isCheck) {
      return resp;
    }

    if (isNew) {
      const createRightsGroup = {
        groupName: paramsGroupName,
        groupCode: paramsGroupCode,
        rightCodes: paramsRightCodes,
        createUser: session.adminId,
        createDate: new Date(),
      };
      const [errCreate, createObj] = await Utils.toPromise(
        this.rightsGroupSchemaService.getModel().create(createRightsGroup),
      );
      if (errCreate) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errCreate.message;
        return resp;
      }
      resp.id = createObj.id;
      const content = this.globalService.serverLang(
        session,
        '新建权限组:({0})',
        'rightsGroup.createLog',
        createObj.groupCode,
      );
      this.userLogsService
        .writeUserLog(session, LogTypeEnum.RightsGroup, content, createObj.id)
        .then();
    } else {
      newRightsGroup.updateUser = session.adminId;
      newRightsGroup.updateDate = new Date();
      await this.rightsGroupSchemaService
        .getModel()
        .syncSaveDBObject(newRightsGroup);
      resp.id = newRightsGroup.id;
      const contentArray = [
        this.globalService.serverLang(
          session,
          '编辑权限组:({0})',
          'rightsGroup.modifyRightsGroup',
          newRightsGroup.groupCode,
        ),
      ];
      contentArray.push(
        ...this.globalService.compareObjectWriteLog(
          session,
          RightsGroup,
          oldRightsGroup,
          newRightsGroup,
        ),
      );
      if (contentArray.length > 1) {
        this.userLogsService
          .writeUserLog(
            session,
            LogTypeEnum.RightsGroup,
            contentArray.join('\r\n'),
            newRightsGroup.id,
          )
          .then();
      }
    }

    return resp;
  }

  async deleteRightsGroup(session: CmsSession, params: DeleteResultDto) {
    const resp = new RespErrorResult();
    const paramsIds = params.ids;
    if (!Array.isArray(paramsIds) || paramsIds.length === 0) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID值不能为空',
        'common.idIsEmpty',
      );
      return resp;
    }
    const where = {
      _id: {
        $in: paramsIds,
      },
    };
    const [err, rightsGroupList] = await Utils.toPromise(
      this.rightsGroupSchemaService.getModel().find(where),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const writeLogResult = [];
    const errResult = []; // 错误集合
    const rightsGroupExistId = []; // 已经存在的权限组ID
    const deleteRightsGroupId: string[] = [];
    const defaultGroupMap =
      this.rightsGroupSchemaService.getDefaultRightsGroup();
    const defaultKeys = Array.from(defaultGroupMap.keys());
    const allowDeleteResult = []; // 允许删除的权限组记录

    for (const rightsGroupInfo of rightsGroupList) {
      rightsGroupExistId.push(rightsGroupInfo.id);
      if (defaultKeys.includes(rightsGroupInfo.groupCode)) {
        errResult.push(
          `(${rightsGroupInfo.id}) ` +
            this.globalService.serverLang(
              session,
              '不能删除默认权限组',
              'rightsGroup.deleteDefaultGroup',
            ),
        );
      } else if (
        !this.globalService.userHasRightsBoolean(
          session,
          ...rightsGroupInfo.rightCodes,
        )
      ) {
        errResult.push(
          `(${rightsGroupInfo.id}) ` +
            this.globalService.serverLang(
              session,
              '不能删除越权的权限组',
              'rightsGroup.deleteLimitPermissionGroup',
            ),
        );
      } else {
        allowDeleteResult.push(rightsGroupInfo);
      }
    }

    if (rightsGroupExistId.length !== paramsIds.length) {
      // 存在 不存在的id数据
      for (const id of paramsIds) {
        if (!rightsGroupExistId.includes(id)) {
          errResult.push(
            `(${id}) ` +
              this.globalService.serverLang(
                session,
                '该权限组不存在',
                'rightsGroup.isNotExist',
              ),
          );
        }
      }
    }

    const modelName = this.rightsGroupSchemaService.getModel().getAliasName();
    for (const rightsGroupInfo of allowDeleteResult) {
      await rightsGroupInfo.deleteOne();
      writeLogResult.push(rightsGroupInfo.groupCode);
      deleteRightsGroupId.push(rightsGroupInfo.id);
      await this.deleteLogSchemaService.createDeleteLog({
        modelName,
        keyWords: rightsGroupInfo.groupCode,
        searchWhere: {
          shopId: rightsGroupInfo.shopId,
          groupCode: rightsGroupInfo.groupCode,
        },
        id: rightsGroupInfo.id,
      });
    }

    if (writeLogResult.length > 0) {
      // 只要有一个删除成功就算成功
      const content = this.globalService.serverLang(
        session,
        '删除权限组:({0})',
        'rightsGroup.deleteLog',
        writeLogResult.join(','),
      );
      this.userLogsService
        .writeUserLog(
          session,
          LogTypeEnum.RightsGroup,
          content,
          deleteRightsGroupId,
        )
        .then();
    }
    resp.code = writeLogResult.length > 0 ? CodeEnum.SUCCESS : CodeEnum.FAIL;
    resp.errResult = errResult;

    return resp;
  }

  async getSingleRightsGroup(
    session: CmsSession,
    params: ReqRightsGroupSingleDto,
  ): Promise<RespRightsGroupSingleDto> {
    const resp = new RespRightsGroupSingleDto();
    const paramsId = params.id;
    const paramsShopId = params.shopId;
    const paramsGroupCode = params.groupCode;

    const where: Record<string, any> = {
      shopId: paramsShopId,
    };
    if (!Utils.isEmpty(paramsId)) {
      where._id = paramsId;
    }
    if (!Utils.isEmpty(paramsGroupCode)) {
      where.groupCode = paramsGroupCode;
    }
    console.log(where);
    if (Object.keys(where).length <= 1) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '缺少必要参数',
        'common.missingParams',
      );
      return resp;
    }

    const [err, rightsGroupInfo] = await Utils.toPromise(
      this.rightsGroupSchemaService.getModel().findOne(where),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    if (Utils.isEmpty(rightsGroupInfo)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '权限组不存在',
        'rightsGroup.isNotExist',
      );
      return resp;
    }
    if (
      !this.globalService.userHasRightsBoolean(
        session,
        ...rightsGroupInfo.rightCodes,
      )
    ) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '无权查看该权限组',
        'rightsGroup.NoPermissionView',
      );
      return resp;
    }

    resp.rightsGroupInfo = Object.assign(
      new ListRightsGroupDto(),
      rightsGroupInfo.toObject(),
    );
    return resp;
  }
}
