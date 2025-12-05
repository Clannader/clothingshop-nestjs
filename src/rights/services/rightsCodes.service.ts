/**
 * Create by oliver.wu 2025/12/4
 */
import { Injectable, Inject } from '@nestjs/common';
import { CmsSession } from '@/common';
import { GlobalService, Utils } from '@/common/utils';

import {
  ReqRightsCodesSearchDto,
  RespRightsCodesSearchDto,
  SearchRightsCodesDto,
} from '../dto';

import { RightsCodesSchemaService } from '@/entities/services';
import { CodeEnum } from '@/common/enum';

@Injectable()
export class RightsCodesService {
  @Inject()
  private readonly rightsCodesSchemaService: RightsCodesSchemaService;

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
      where.codeNumber = Utils.getIgnoreCase(codeNumber, true);
    }
    if (!Utils.isEmpty(description)) {
      where.description = Utils.getIgnoreCase(description, true);
    }

    const [err, result] = await Utils.toPromise(
      this.rightsCodesSchemaService
        .getModel()
        .find(where, { __v: 0 })
        .sort({ _id: -1 }),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const rightsCodesList: SearchRightsCodesDto[] = [];
    for (const row of result) {
      rightsCodesList.push({
        id: row.id,
        codeNumber: row.code,
        codeKey: row.key,
        codeCategory: row.category,
        cnLabel: row.cnLabel,
        enLabel: row.enLabel,
        description: row.description,
      });
    }
    resp.rightsCodes = rightsCodesList;
    resp.total = result.length;

    return resp;
  }
}
