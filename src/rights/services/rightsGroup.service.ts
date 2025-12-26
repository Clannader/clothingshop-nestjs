/**
 * Create by oliver.wu 2025/12/4
 */
import { Injectable, Inject } from '@nestjs/common';
import { CmsSession, RespModifyDataDto } from '@/common';
import { GlobalService, Utils } from '@/common/utils';
import { instanceToInstance } from 'class-transformer';

import { UserLogsService } from '@/logs';
import { RightsCodesGroupSchemaService } from '@/entities/services';

import { ReqRightsGroupSearchDto, RespRightsGroupSearchDto } from '../dto';

@Injectable()
export class RightsGroupService {
  @Inject()
  private readonly globalService: GlobalService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  getRightsGroupList(session: CmsSession, params: ReqRightsGroupSearchDto) {
    const resp = new RespRightsGroupSearchDto();
    return resp;
  }

  saveRightsGroup() {}

  checkRightsGroup() {}

  deleteRightsGroup() {}
}
