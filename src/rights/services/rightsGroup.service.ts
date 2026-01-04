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
import { RightsGroupSchemaService } from '@/entities/services';
import { RightsGroup, RightsGroupDocument } from '@/entities/schema';

import {
  ReqRightsGroupModifyDto,
  ReqRightsGroupSearchDto,
  RespRightsGroupSearchDto,
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

  getRightsGroupList(session: CmsSession, params: ReqRightsGroupSearchDto) {
    const resp = new RespRightsGroupSearchDto();
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

    if (Utils.isEmpty(params.groupCode)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '权限组名不能为空',
        'rightsGroup.groupCodeIsNotEmpty',
      );
      return resp;
    }
    if (Utils.isEmpty(params.rightCodes)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '权限代码不能为空',
        'rightsGroup.rightCodesIsNotEmpty',
      );
      return resp;
    }
    if (!groupCodeExp.test(params.groupCode)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '权限组名格式错误',
        'rightsGroup.groupCodeFormatError',
      );
      return resp;
    }
    params.rightCodes.forEach((code) => {
      if (!singleGroupExp.test(code)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '权限代码格式错误',
          'rightsGroup.rightCodesFormatError',
        );
        return resp;
      }
    });

    // TODO 其他额外判断

    const where = {
      groupCode: params.groupCode,
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
        params.groupCode,
      );
      return resp;
    }

    if (isCheck) {
      return resp;
    }

    if (isNew) {
      const createRightsGroup = {
        groupName: params.groupName,
        groupCode: params.groupCode,
        rightCodes: params.rightCodes,
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
        createObj.groupName,
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

  deleteRightsGroup(session: CmsSession, params: DeleteResultDto) {
    const resp = new RespErrorResult();
    return resp;
  }
}
