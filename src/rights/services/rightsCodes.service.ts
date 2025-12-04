/**
 * Create by oliver.wu 2025/12/4
 */
import { Injectable, Inject } from '@nestjs/common';
import { CmsSession } from '@/common';

import { ReqRightsCodesSearchDto, RespRightsCodesSearchDto } from '../dto';

@Injectable()
export class RightsCodesService {
  getRightsCodesList(session: CmsSession, params: ReqRightsCodesSearchDto) {
    const resp = new RespRightsCodesSearchDto();
    return resp;
  }
}
