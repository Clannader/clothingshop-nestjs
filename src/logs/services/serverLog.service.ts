/**
 * Create by oliver.wu 2025/3/7
 */
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { Utils } from '@/common/utils';
import validator from 'validator';

import { RespServerLogList, ListServerLogDto } from '@/logs/dto';

@Injectable()
export class ServerLogService {
  @Inject()
  private readonly configService: ConfigService;

  getServerLogList() {
    const serverUrl = this.configService.get<string>('serverLog');
    const resp = new RespServerLogList();
    const serverLogList: ListServerLogDto[] = [];
    resp.serverLogs = serverLogList;
    if (Utils.isEmpty(serverUrl)) {
      return resp;
    }
  }
}
