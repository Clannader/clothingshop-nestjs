/**
 * Create by oliver.wu 2025/12/4
 */
import { Injectable, Inject } from '@nestjs/common';
import { CmsSession, RespModifyDataDto } from '@/common';
import { GlobalService, Utils } from '@/common/utils';
import { instanceToInstance } from 'class-transformer';

import {
  ReqRightsCodesSearchDto,
  RespRightsCodesSearchDto,
  SearchRightsCodesDto,
  ReqRightsCodesModifyDto,
} from '../dto';

import { RightsCodeSchemaService } from '@/entities/services';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { RightsCodeDocument, RightsCode } from '@/entities/schema';
import { UserLogsService } from '@/logs';
import { getAllRightsCode } from '../rights.constants';

@Injectable()
export class RightsCodesService {
  @Inject()
  private readonly rightsCodesSchemaService: RightsCodeSchemaService;

  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  private readonly allRightsCode = getAllRightsCode();

  async getRightsCodesList(
    session: CmsSession,
    params: ReqRightsCodesSearchDto,
  ) {
    const resp = new RespRightsCodesSearchDto();
    const codeNumber = params.codeNumber;
    const codeLabel = params.codeLabel;
    const description = params.description;
    const where: Record<string, any> = {};

    if (!Utils.isEmpty(codeNumber)) {
      where.code = Utils.getIgnoreCase(codeNumber, true);
    }
    if (!Utils.isEmpty(description)) {
      where.description = Utils.getIgnoreCase(description, true);
    }
    if (!Utils.isEmpty(codeLabel)) {
      where.$or = [
        { cnLabel: Utils.getIgnoreCase(codeLabel, true) },
        { enLabel: Utils.getIgnoreCase(codeLabel, true) },
      ];
    }

    const [err, result] = await Utils.toPromise(
      this.rightsCodesSchemaService
        .getModel()
        .find(where, { __v: 0 })
        .sort({ code: 1 }),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const rightsCodesList: SearchRightsCodesDto[] = [];
    result
      .filter((item) =>
        this.globalService.userHasRightsBoolean(session, item.code),
      )
      .forEach((row) => {
        rightsCodesList.push({
          id: row.id,
          codeNumber: row.code,
          codeKey: row.key,
          codeCategory: row.category,
          cnLabel: row.cnLabel,
          enLabel: row.enLabel,
          description: row.description,
        });
      });
    resp.rightsCodes = rightsCodesList;
    resp.total = rightsCodesList.length;

    return resp;
  }

  async saveRightsCodes(session: CmsSession, params: ReqRightsCodesModifyDto) {
    const resp = new RespModifyDataDto();
    // 判断是否是新建还是编辑,如果是编辑,id必填
    const id = params.id;
    if (Utils.isEmpty(params.id)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID值不能为空',
        'common.idIsEmpty',
      );
      return resp;
    }

    // 1.这里需要判断用户是否有这个权限,才能编辑
    // 2.判断修改的权限是否真的存在

    let oldRightsCodes: RightsCodeDocument,
      newRightsCodes: RightsCodeDocument,
      err: Error;

    [err, oldRightsCodes] = await Utils.toPromise(
      this.rightsCodesSchemaService.getModel().findById(id),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    if (
      Utils.isEmpty(oldRightsCodes) ||
      !this.allRightsCode.includes(oldRightsCodes.code)
    ) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '该权限代码不存在',
        'rightsCodes.isNotExist',
      );
      return resp;
    }

    if (
      !this.globalService.userHasRightsBoolean(session, oldRightsCodes.code)
    ) {
      resp.code = CodeEnum.NO_RIGHTS;
      resp.msg = this.globalService.serverLang(
        session,
        '抱歉，你没有权限编辑该权限代码',
        'rightsCodes.noRightsModifyCode',
      );
      return resp;
    }

    newRightsCodes = instanceToInstance(oldRightsCodes);
    if (!Utils.isEmpty(params.cnLabel)) {
      newRightsCodes.cnLabel = params.cnLabel;
    } else {
      params.cnLabel = oldRightsCodes.cnLabel;
    }

    if (!Utils.isEmpty(params.enLabel)) {
      newRightsCodes.enLabel = params.enLabel;
    } else {
      params.enLabel = oldRightsCodes.enLabel;
    }

    if (!Utils.isEmpty(params.description)) {
      newRightsCodes.description = params.description;
    } else {
      params.description = oldRightsCodes.description;
    }

    // 新旧都需要字段进行字段校验
    if (Utils.isEmpty(params.cnLabel)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '中文标签不能为空',
        'rightsCodes.cnLabelIsEmpty',
      );
    }
    if (Utils.isEmpty(params.enLabel)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '英文标签不能为空',
        'rightsCodes.enLabelIsEmpty',
      );
    }

    [err] = await Utils.toPromise(newRightsCodes.save());
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    resp.id = newRightsCodes.id;
    // 写日志...
    const contentArray = [
      this.globalService.serverLang(
        session,
        '编辑权限代码:({0})',
        'rightsCodes.modifiedLog',
        newRightsCodes.code,
      ),
    ];
    contentArray.push(
      ...this.globalService.compareObjectWriteLog(
        session,
        RightsCode,
        oldRightsCodes,
        newRightsCodes,
      ),
    );
    if (contentArray.length > 1) {
      this.userLogsService
        .writeUserLog(
          session,
          LogTypeEnum.RightsCodes,
          contentArray.join('\r\n'),
          newRightsCodes.id,
        )
        .then();
    }

    return resp;
  }
}
