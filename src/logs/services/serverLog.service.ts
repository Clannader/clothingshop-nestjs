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
  RespInternalServerLogDto,
  LogDetails,
  ReqServerLogViewDto,
  RespServerLogViewDto,
} from '@/logs/dto';
import { CodeEnum } from '@/common/enum';
import { CmsSession } from '@/common';
import Axios from 'axios';
import { join } from 'path';
import * as fs from 'fs';
import * as moment from 'moment';

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
      const url = `http://${serverAddress}/cms/api/logs/serverLog/internal/list`;
      const [err, requestResult] = await Utils.toPromise(
        Axios.create({
          timeout: 30 * 1000,
          headers,
        }).get(url, { params: params }),
      );
      if (err || requestResult.data.code !== CodeEnum.SUCCESS) {
        serverLogList.push({
          serverName: 'NULL',
          logs: [],
        });
        continue;
      }
      const data = requestResult.data;
      serverLogList.push({
        serverName: `Server${++i}`,
        logs: data.logs || [],
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

  getInternalServerLogList(params: ReqServerLogListDto) {
    const resp = new RespInternalServerLogDto();
    const readServerLog = new ReadServerLog();
    let startDate = null;
    if (!Utils.isEmpty(params.date)) {
      startDate = new Date(params.date);
    }
    resp.logs = readServerLog.getRangeFiles('logs', startDate);
    return resp;
  }

  viewServerLogFile(session: CmsSession, params: ReqServerLogViewDto) {
    const resp = new RespServerLogViewDto();
    return resp;
  }
}

class ReadServerLog {
  private readonly rootPath = join(process.cwd());

  getRangeFiles(path: string, date: Date): LogDetails[] {
    const result: LogDetails[] = [];
    if (date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
    }
    const logPath = join(this.rootPath, path);
    fs.readdirSync(logPath)
      .filter((fileName) => /^(server)\.log\.\d{4}-\d{2}-\d{2}$/.test(fileName))
      .forEach((fileName) => {
        const stat = fs.statSync(join(logPath, fileName));
        const mtime = stat.mtime;
        if (!date || mtime.getTime() >= date.getTime()) {
          result.push({
            fileName,
            fileSize: stat.size,
            fileSizeLabel: Utils.getFileSize(stat.size),
            createTimeMs: stat.birthtimeMs,
            createDate: moment(stat.birthtimeMs).format('YYYY-MM-DD'),
          });
        }
      });
    result.sort((t1, t2) => {
      // 按创建日期倒叙
      return t2.createTimeMs - t1.createTimeMs;
    });
    return result;
  }
}
