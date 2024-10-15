/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { CommonResult } from '@/common/dto';
import { GlobalService, Utils } from '@/common/utils';
import { LogTypeEnum } from '@/common/enum';
import { CmsSession } from '@/common';

import { SystemDataSchemaService } from '@/entities/services';
import { TimeZoneData } from '@/entities/schema';
import { UserLogsService } from '@/logs';

import { defaultTimeZone } from '../defaultSystemData';
import { ReqTimeZoneListDto, ReqTimeZoneCreateDto } from '../dto';

@Injectable()
export class TimeZoneService {
  @Inject()
  private readonly systemDataSchemaService: SystemDataSchemaService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly globalService: GlobalService;

  getTimeZoneList(params: ReqTimeZoneListDto) {
    const resp = new CommonResult();
    return resp;
  }

  getTimeZoneArray() {
    return new CommonResult();
  }

  createTimeZone(params: ReqTimeZoneCreateDto) {
    return new CommonResult();
  }

  modifyTimeZone() {
    return new CommonResult();
  }

  deleteTimeZone() {
    return new CommonResult();
  }

  checkTimeZone() {
    // 校验时区数据
    return new CommonResult();
  }

  async syncTimeZoneData(session: CmsSession) {
    // 同步默认时区数据到数据库中
    let syncSuccessNumber = 0;
    for (const timeZoneInfo of defaultTimeZone) {
      const [, result] = await this.systemDataSchemaService
        .syncTimeZoneObject(<TimeZoneData>timeZoneInfo)
        .then((result) => [null, result])
        .catch((err) => [err]);
      if (Utils.isEmpty(result)) {
        syncSuccessNumber++;
      }
    }
    if (syncSuccessNumber > 0) {
      const content = this.globalService.serverLang(
        '成功同步{0}条默认时区数据',
        'timeZone.syncSuccess',
        syncSuccessNumber,
      );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.TimeZone,
        content,
      );
    }
    return new CommonResult();
  }
}
