/**
 * Create by oliver.wu 2024/11/27
 */
import { Injectable, Inject } from '@nestjs/common';
import { GlobalService } from '@/common/utils';

import {
  ReqSystemConfigListDto,
  RespSystemConfigListDto,
  RespSystemConfigCreateDto,
  ReqParentConfigModifyDto,
  ReqParentConfigDeleteDto,
} from '../dto/config';

import { CmsSession, RespErrorResult } from '@/common';

@Injectable()
export class SystemConfigService {
  @Inject()
  private readonly globalService: GlobalService;

  getSystemConfigList(params: ReqSystemConfigListDto) {
    const resp = new RespSystemConfigListDto();
    return resp;
  }

  saveSystemParentConfig(
    session: CmsSession,
    params: ReqParentConfigModifyDto,
    isNew: boolean,
  ): RespSystemConfigCreateDto {
    const resp = new RespSystemConfigCreateDto();
    return resp;
  }

  deleteSystemConfig(session: CmsSession, params: ReqParentConfigDeleteDto) {
    const resp = new RespErrorResult()
    return resp;
  }
}
