/**
 * Create by oliver.wu 2025/12/4
 */
import { Injectable, Inject } from '@nestjs/common';
import {
  CmsSession,
  DeleteResultDto,
  RespErrorResult,
  RespModifyDataDto,
} from '@/common';
import { GlobalService, Utils } from '@/common/utils';
import { instanceToInstance } from 'class-transformer';

import { UserLogsService } from '@/logs';
import { RightsGroupSchemaService } from '@/entities/services';

import {
  ReqRightsGroupSearchDto,
  RespRightsGroupSearchDto,
  RespRightsGroupCreateDto,
  ReqRightsGroupModifyDto,
} from '../dto';

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

  saveRightsGroup(
    session: CmsSession,
    params: ReqRightsGroupModifyDto,
    isNew: boolean,
  ) {
    const resp = new RespRightsGroupCreateDto();

    const checkResp = this.checkRightsGroup(session, params, isNew, false);

    if (!checkResp.isSuccess()) {
      resp.code = checkResp.code;
      resp.msg = checkResp.msg;
      return resp;
    }
    resp.id = checkResp.id;
    return resp;
  }

  checkRightsGroup(
    session: CmsSession,
    params: ReqRightsGroupModifyDto,
    isNew: boolean,
    isCheck: boolean,
  ) {
    const resp = new RespRightsGroupCreateDto();
    return resp;
  }

  deleteRightsGroup(session: CmsSession, params: DeleteResultDto) {
    const resp = new RespErrorResult();
    return resp;
  }
}
