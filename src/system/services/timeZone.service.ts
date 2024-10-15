/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { CommonResult } from '@/common/dto';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';

import { SystemDataSchemaService } from '@/entities/services';

import { defaultTimeZone } from '../defaultSystemData';
import { ReqTimeZoneListDto, ReqTimeZoneCreateDto } from '../dto';

@Injectable()
export class TimeZoneService {
  @Inject()
  private readonly systemDataSchemaService: SystemDataSchemaService;

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

  syncTimeZoneData() {
    // 同步默认时区数据到数据库中
    return new CommonResult();
  }
}
