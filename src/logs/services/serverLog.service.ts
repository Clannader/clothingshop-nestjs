/**
 * Create by oliver.wu 2025/3/7
 */
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { Utils } from '@/common/utils';
import validator from 'validator';

import {
  RespServerLogListDto,
  ListServerLogDto,
  ReqServerLogListDto,
} from '@/logs/dto';

@Injectable()
export class ServerLogService {
  @Inject()
  private readonly configService: ConfigService;

  getServerLogList(params: ReqServerLogListDto) {
    const serverUrl = this.configService.get<string>('serverLog');
    const resp = new RespServerLogListDto();
    const serverLogList: ListServerLogDto[] = [];
    resp.serverLogs = serverLogList;
    if (Utils.isEmpty(serverUrl)) {
      return resp;
    }
  }
}
