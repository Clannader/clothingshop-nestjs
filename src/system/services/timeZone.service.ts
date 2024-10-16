/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { CommonResult, DeleteResultDto, RespErrorResult } from '@/common/dto';
import { GlobalService, Utils } from '@/common/utils';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { CmsSession } from '@/common';

import { SystemDataSchemaService } from '@/entities/services';
import { TimeZoneData, TimeZoneDataDocument } from '@/entities/schema';
import { UserLogsService } from '@/logs';

import { defaultTimeZone } from '../defaultSystemData';
import {
  ReqTimeZoneListDto,
  RespTimeZoneListDto,
  ListTimeZoneDto,
  ReqTimeZoneModifyDto,
  RespTimeZoneAllDto,
  CreateTimeZoneDto,
  RespTimeZoneCreateDto,
} from '../dto';

type SearchTimeZone = {
  timeZone?: Record<string, any>;
};

@Injectable()
export class TimeZoneService {
  @Inject()
  private readonly systemDataSchemaService: SystemDataSchemaService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly globalService: GlobalService;

  async getTimeZoneList(params: ReqTimeZoneListDto) {
    const resp = new RespTimeZoneListDto();
    const timeZoneParams = params.timeZone;
    const where: SearchTimeZone = {};
    if (!Utils.isEmpty(timeZoneParams)) {
      where.timeZone = Utils.getIgnoreCase(timeZoneParams, true);
    }
    let err: any, result: Array<TimeZoneDataDocument>;
    [err, result] = await this.systemDataSchemaService
      .getTimeZoneDataModel()
      .find(where, { __v: 0 })
      .sort({ _id: -1 })
      .then((result) => [null, result])
      .catch((err) => [err]);
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const timeZones: ListTimeZoneDto[] = [];
    for (const row of result) {
      timeZones.push({
        id: row.id,
        timeZoneName: row.timeZone,
        summerTime: row.summer,
        winterTime: row.winter,
      });
    }
    resp.timeZones = timeZones;
    resp.total = result.length;
    return resp;
  }

  async getAllTimeZone() {
    const resp = new RespTimeZoneAllDto();
    const timeZones: CreateTimeZoneDto[] = [];

    let err: any, result: Array<TimeZoneDataDocument>;
    [err, result] = await Utils.toPromise(
      this.systemDataSchemaService
        .getTimeZoneDataModel()
        .find({}, { __v: 0, _id: 0 })
        .sort({ summer: 1 }),
    );
    if (err) {
      resp.timeZones = timeZones;
      return resp;
    }
    for (const row of result) {
      timeZones.push({
        timeZoneName: row.timeZone,
        summerTime: row.summer,
        winterTime: row.winter,
      });
    }

    resp.timeZones = timeZones;
    return resp;
  }

  saveTimeZone(
    session: CmsSession,
    params: ReqTimeZoneModifyDto,
    isNew: boolean,
  ) {
    const resp = new RespTimeZoneCreateDto();

    const checkResp = this.checkInfoTimeZone(session, params, isNew, false);

    if (!checkResp.isSuccess()) {
      resp.code = checkResp.code;
      resp.msg = checkResp.msg;
      return resp;
    }
    resp.id = checkResp.id;
    return resp;
  }

  async deleteTimeZone(session: CmsSession, params: DeleteResultDto) {
    const resp = new RespErrorResult();
    const idsParams = params.ids;
    if (!Array.isArray(idsParams) || idsParams.length === 0) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        'Ids不能为空',
        'common.idsIsEmpty',
      );
      return resp;
    }
    const where = {
      _id: {
        $in: idsParams,
      },
    };
    const fields = {
      timeZone: 1,
    };
    let err: any, timeZoneList: Array<TimeZoneDataDocument>;
    [err, timeZoneList] = await Utils.toPromise(
      this.systemDataSchemaService.getTimeZoneDataModel().find(where, fields),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const writeLogResult = [];
    const errResult = [];
    const timeZoneNameList = [];
    const timeZoneExistId = [];

    for (const timeZoneInfo of timeZoneList) {
      timeZoneNameList.push(timeZoneInfo.timeZone);
      timeZoneExistId.push(timeZoneInfo.id);
    }

    if (timeZoneExistId.length !== idsParams.length) {
      // 存在 不存在的id数据
      for (const id of idsParams) {
        if (!timeZoneExistId.includes(id)) {
          errResult.push(
            `(${id}) ` +
              this.globalService.serverLang(
                '该时区不存在',
                'timeZone.isNotExist',
              ),
          );
        }
      }
    }

    // TODO 以后要新增店铺列表如果使用到该时区不能删除的逻辑
    // const existShopList = await fineExistShop(timeZoneNameList)
    // const timeZoneShopMap = new Map()
    // for (const shopInfo of existShopList) {
    //   if (timeZoneShopMap.has(shopInfo.timeZone)) {
    //     timeZoneShopMap.get(shopInfo.timeZone).push(shopInfo.shopId)
    //   } else {
    //     timeZoneShopMap.set(shopInfo.timeZone, [shopInfo.shopId])
    //   }
    // }
    // if (timeZoneShopMap.size > 0) {
    //   // 时区有被店铺使用则无法删除
    //   for (const [key, value] of timeZoneShopMap) {
    //     errResult.push(this.globalService.serverLang('{0}时区已被以下店铺使用:{1}', key, value.join(',')))
    //   }
    //   return res.send({code: 0, msg: errResult.join(',')})
    // }

    for (const timeZoneObj of timeZoneList) {
      await timeZoneObj.deleteOne();
      writeLogResult.push(timeZoneObj.timeZone);
    }

    if (writeLogResult.length > 0) {
      // 只要有一个删除成功就算成功
      const content = this.globalService.serverLang(
        '删除时区:({0})',
        'timeZone.deleteLog',
        writeLogResult.join(','),
      );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.TimeZone,
        content,
      );
    } else {
      // 这里是删除全部都失败的情况
      resp.code = CodeEnum.FAIL;
      resp.errResult = errResult;
      return resp;
    }
    return resp;
  }

  /**
   * 校验时区数据以及保存数据
   * @param session 会话对象
   * @param params 编辑对象
   * @param isNew 是否是新建
   * @param isCheck 是否是仅检查
   */
  checkInfoTimeZone(
    session: CmsSession,
    params: ReqTimeZoneModifyDto,
    isNew: boolean,
    isCheck: boolean,
  ) {
    const resp = new RespTimeZoneCreateDto();
    return resp;
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
