/**
 * Create by oliver.wu 2024/11/27
 */
import { Injectable, Inject } from '@nestjs/common';
import { GlobalService } from '@/common/utils';

import { ReqSystemConfigListDto, RespSystemConfigListDto } from '../dto/config';

@Injectable()
export class SystemConfigService {
  @Inject()
  private readonly globalService: GlobalService;

  getSystemConfigList(params: ReqSystemConfigListDto) {
    console.log(params.onlyInclude);
    const resp = new RespSystemConfigListDto();
    return resp;
  }
}
