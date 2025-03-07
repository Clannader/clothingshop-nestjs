/**
 * Create by oliver.wu 2025/3/7
 */
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { GlobalService, Utils } from '@/common/utils';
import validator from 'validator';
import {
  RespServerLogListDto,
  ListServerLogDto,
  ReqServerLogListDto,
} from '@/logs/dto';
import { CodeEnum } from '@/common/enum';
import { CmsSession } from '@/common';
import Axios from 'axios';

@Injectable()
export class ServerLogService {
  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly globalService: GlobalService;

  async getServerLogList(session: CmsSession, params: ReqServerLogListDto) {
    const serverUrl = this.configService.get<string>('serverLog');
    const resp = new RespServerLogListDto();
    const serverLogList: ListServerLogDto[] = [];

    resp.serverLogs = serverLogList;
    if (Utils.isEmpty(serverUrl)) {
      return resp;
    }
    // 校验serverLog的配置是不是ip:port,ip2:port2这种格式
    const serverArray = serverUrl.split(',');
    let isValidatorAddress = true;
    for (const serverAddress of serverArray) {
      isValidatorAddress = this.validatorAddress(serverAddress);
      if (!isValidatorAddress) {
        break;
      }
    }
    if (!isValidatorAddress) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '服务器日志地址格式错误',
        'serverLog.logFormatError',
      );
      return resp;
    }

    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      credential: session.credential,
    };
    let i = 0;
    for (const serverAddress of serverArray) {
      const url = `http://${serverAddress}/cms/api/logs/serverLog/logs`;
      const [err, requestResult] = await Utils.toPromise(
        Axios.create({
          timeout: 30 * 1000,
          headers,
        }).get(url, { params: params }),
      );
      if (err) {
        serverLogList.push({
          serverName: 'NULL',
          logs: [],
        });
        continue;
      }
      const data = requestResult.data;
      console.log(data);
      serverLogList.push({
        serverName: `Server${++i}`,
        logs: [],
      });
    }
    return resp;
  }

  // 校验ip:port
  private validatorAddress(serverAddress: string) {
    const address = serverAddress.split(':');
    if (address.length !== 2) {
      return false;
    }
    const [ip, port] = address;
    return validator.isIP(ip) && validator.isPort(port);
  }
}
