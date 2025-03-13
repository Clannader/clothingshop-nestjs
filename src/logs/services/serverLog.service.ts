/**
 * Create by oliver.wu 2025/3/7
 */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@/common/config';
import { GlobalService, Utils } from '@/common/utils';
import validator from 'validator';
import {
  ListServerLogDto,
  LogDetails,
  ReqServerLogListDto,
  ReqServerLogViewDto,
  RespInternalServerLogDto,
  RespServerLogListDto,
  RespServerLogViewDto,
} from '@/logs/dto';
import { CodeEnum, ServerLogViewEnum } from '@/common/enum';
import { CmsSession } from '@/common';
import Axios from 'axios';
import { join } from 'path';
import * as fs from 'fs';
import * as moment from 'moment';

type DownloadLogDetails = {
  content: string;
  hasMore: boolean;
  startByte: number;
  endByte: number;
};

type ReadFileOptions = {
  start: number;
  end: number;
};

@Injectable()
export class ServerLogService {
  @Inject()
  private readonly configService: ConfigService;

  @Inject()
  private readonly globalService: GlobalService;

  async getServerLogList(session: CmsSession, params: ReqServerLogListDto) {
    const resp = new RespServerLogListDto();
    const serverLogList: ListServerLogDto[] = [];
    const serverUrl = this.getServerUrl();
    if (Utils.isEmpty(serverUrl)) {
      resp.code = CodeEnum.SUCCESS;
      resp.serverLogs = serverLogList;
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
    for (const serverAddress of serverUrl) {
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
    resp.code = CodeEnum.SUCCESS;
    resp.serverLogs = serverLogList;
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

  private getServerUrl(): string[] {
    const serverUrl = this.configService.get<string>('serverLog');
    if (Utils.isEmpty(serverUrl)) {
      return [];
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
      return [];
    }
    return serverArray;
  }

  async viewServerLogFile(session: CmsSession, params: ReqServerLogViewDto) {
    const resp = new RespServerLogViewDto();
    const serverUrl = this.getServerUrl();
    if (Utils.isEmpty(serverUrl)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '服务器日志地址配置错误',
        'serverLog.logAddressError',
      );
      return resp;
    }
    const serverName = params.serverName;
    const serverMatch = serverName.match(/^Server(\d)$/);
    if (!serverMatch || +serverMatch[1] - 1 >= serverUrl.length) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '该服务器不存在',
        'serverLog.serverNameIsNotExists',
      );
      return resp;
    }
    const serverIndex = serverMatch[1];
    const serverAddress = serverUrl[+serverIndex - 1];

    const type =
      params.viewType === ServerLogViewEnum.View ? 'view' : 'download';
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      credential: session.credential,
    };
    const url = `http://${serverAddress}/cms/api/logs/serverLog/internal/${type}`;
    const [err, requestResult] = await Utils.toPromise(
      Axios.create({
        timeout: 30 * 1000,
        headers,
      }).post(url, params),
    );
    if (err || requestResult.data.code !== CodeEnum.SUCCESS) {
      resp.code = CodeEnum.FAIL;
      resp.msg = err?.message || requestResult?.data?.msg;
      return resp;
    }
    const data = requestResult.data;
    if (params.viewType === ServerLogViewEnum.View) {
      resp.hasMore = data.hasMore;
      resp.startByte = data.startByte;
      resp.endByte = data.endByte;
    }
    resp.logContent = data.logContent;
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  async internalViewServerLogFile(
    session: CmsSession,
    params: ReqServerLogViewDto,
  ) {
    const resp = new RespServerLogViewDto();
    // 使用流来读文件
    // 1.下载文件判断大小,超过大小的,按最末尾的下载最大文件回去
    // 2.判断文件是否存在
    const readServerLog = new ReadServerLog();
    const [err, result] = await Utils.toPromise<DownloadLogDetails>(
      readServerLog.getFileStream('logs', params.logName, {
        start: params.startByte,
        end: params.endByte,
      }),
    );
    if (err) {
      resp.code = CodeEnum.FAIL;
      resp.msg = err.message;
      return resp;
    }
    if (params.viewType === ServerLogViewEnum.View) {
      resp.hasMore = result.hasMore;
      resp.startByte = result.startByte;
      resp.endByte = result.endByte;
    }
    resp.logContent = result.content;
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }
}

class ReadServerLog {
  private readonly rootPath = join(process.cwd());

  getRangeFiles(dirPath: string, date: Date): LogDetails[] {
    const result: LogDetails[] = [];
    if (date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
    }
    const logPath = join(this.rootPath, dirPath);
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

  getFileStream(dirPath: string, fileName: string, options: ReadFileOptions) {
    const logPath = join(this.rootPath, dirPath, fileName);
    if (!fs.existsSync(logPath)) {
      return Promise.reject({
        message: `The fileName (${fileName}) is not exist`,
      });
    }
    const readOptions = {
      // encoding: 'utf8',
      start: undefined,
      end: undefined,
    };
    const isView = !Utils.isEmpty(options.start) && !Utils.isEmpty(options.end);
    if (isView) {
      readOptions.start = options.start;
      readOptions.end = options.end;
    }
    let startByte = options.start;
    let endByte = options.end;

    return new Promise<DownloadLogDetails>((resolve, reject) => {
      const stream = fs.createReadStream(logPath, readOptions);
      let bufferStr = '';
      stream.on('data', (chunk) => {
        bufferStr += chunk.toString();
      });

      stream.on('error', (err) => {
        return reject(err);
      });

      stream.on('end', () => {
        // 读取文件结束时,查一下文件的总大小
        const fsStat = fs.statSync(logPath);
        const hasMore = fsStat.size > endByte;
        if (isView) {
          startByte = endByte + 1; // 这里返回给前端下一次加载的开始位
          endByte += 10 * 1024;
          // 判断bufferArr的最后一位是否是乱码,否则不返回
          const lastChar = bufferStr.substring(
            bufferStr.length - 1,
            bufferStr.length,
          );
          if (lastChar === '�') {
            // 这里占了1个位数
            bufferStr = bufferStr.substring(0, bufferStr.length - 1);
            // 这里确实有需要研究一下,因为中文在utf-8里面占用3个字节
            // 然后满3位的时候可以变成真的中文,但是满1位或者2位的时候,会变成�
            // 然后这时候bufferArr里面的�,并不知道是占了2位还是1位,所以才导致了
            // 有时候要减2位或者1位的情况
            /**
             * 中文汉字：
             字节数 : 2;编码：GB2312
             字节数 : 2;编码：GBK
             字节数 : 2;编码：GB18030
             字节数 : 1;编码：ISO-8859-1
             字节数 : 3;编码：UTF-8
             字节数 : 4;编码：UTF-16
             字节数 : 2;编码：UTF-16BE
             字节数 : 2;编码：UTF-16LE
             */
            startByte -= 2;
          }
          const firstChar = bufferStr.substring(0, 1);
          if (firstChar === '�') {
            // 如果startByte减多了1,就会导致第一个是乱码,去掉即可
            bufferStr = bufferStr.substring(1);
          }
        }
        return resolve({
          content: Utils.stringToBase64(bufferStr),
          hasMore,
          startByte,
          endByte,
        });
      });
    });
  }
}
