/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';
import { instanceToInstance } from 'class-transformer';

import { CommonResult, DeleteResultDto, RespErrorResult } from '@/common/dto';
import { GlobalService, Utils } from '@/common/utils';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { CmsSession, timeZoneExp } from '@/common';

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

type CheckTimeZone = {
  timeZone: string,
  _id?: {
    $ne: string;
  };
}

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
    const [err, result] = await Utils.toPromise(
      this.systemDataSchemaService
        .getTimeZoneDataModel()
        .find(where, { __v: 0 })
        .sort({ _id: -1 }),
    );
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

    const [err, result] = await Utils.toPromise(
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

  async saveTimeZone(
    session: CmsSession,
    params: ReqTimeZoneModifyDto,
    isNew: boolean,
  ) {
    const resp = new RespTimeZoneCreateDto();

    const checkResp = await this.checkInfoTimeZone(
      session,
      params,
      isNew,
      false,
    );

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
        session,
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
    const [err, timeZoneList] = await Utils.toPromise(
      this.systemDataSchemaService.getTimeZoneDataModel().find(where, fields),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const writeLogResult = []; // 写log时需要的timeZone名称
    const errResult = []; // 错误集合
    const timeZoneNameList = []; // 查询是否存在时区的条件
    const timeZoneExistId = []; // 已经存在的时区ID
    const deleteTimeZoneId: string[] = []; // 需要删除的时区ID

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
                session,
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
      deleteTimeZoneId.push(timeZoneObj.id);
    }

    if (writeLogResult.length > 0) {
      // 只要有一个删除成功就算成功
      const content = this.globalService.serverLang(
        session,
        '删除时区:({0})',
        'timeZone.deleteLog',
        writeLogResult.join(','),
      );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.TimeZone,
        content,
        deleteTimeZoneId,
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
  async checkInfoTimeZone(
    session: CmsSession,
    params: ReqTimeZoneModifyDto,
    isNew: boolean,
    isCheck: boolean,
  ) {
    const resp = new RespTimeZoneCreateDto();
    // 判断是否是新建还是编辑,如果是编辑,id必填
    const id = params.id;
    if (!isNew && Utils.isEmpty(params.id)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        'ID值不能为空',
        'common.idIsEmpty',
      );
      return resp;
    }
    let oldTimeZone: TimeZoneDataDocument,
      newTimeZone: TimeZoneDataDocument,
      err: Error;
    if (!isNew) {
      // 如果是编辑,判断id值是否存在该时区
      [err, oldTimeZone] = await Utils.toPromise(
        this.systemDataSchemaService.getTimeZoneDataModel().findById(id),
      );
      if (err) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = err.message;
        return resp;
      }
      if (Utils.isEmpty(oldTimeZone)) {
        resp.code = CodeEnum.FAIL;
        resp.msg = this.globalService.serverLang(
          session,
          '该时区不存在',
          'timeZone.isNotExist',
        );
        return resp;
      }
      newTimeZone = instanceToInstance(oldTimeZone); // 可以克隆查回来的数据库对象
      if (!Utils.isEmpty(params.timeZoneName)) {
        newTimeZone.timeZone = params.timeZoneName;
      } else {
        // 因为编辑这些字段可不传,不传时使用数据库的旧值,如果传则修改查回来的数据库的值
        params.timeZoneName = oldTimeZone.timeZone;
      }

      if (!Utils.isEmpty(params.summerTime)) {
        newTimeZone.summer = params.summerTime;
      } else {
        params.summerTime = oldTimeZone.summer;
      }

      if (!Utils.isEmpty(params.winterTime)) {
        newTimeZone.winter = params.winterTime;
      } else {
        params.winterTime = oldTimeZone.winter;
      }
    }

    // 新旧都需要字段进行字段校验
    if (Utils.isEmpty(params.timeZoneName)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '时区名称不能为空',
        'timeZone.nameIsNotEmpty',
      );
      return resp;
    }
    if (Utils.isEmpty(params.summerTime)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '夏令时不能为空',
        'timeZone.summerIsNotEmpty',
      );
      return resp;
    }
    if (Utils.isEmpty(params.winterTime)) {
      resp.code = CodeEnum.EMPTY;
      resp.msg = this.globalService.serverLang(
        session,
        '冬令时不能为空',
        'timeZone.winterIsNotEmpty',
      );
      return resp;
    }

    if (!timeZoneExp.test(params.summerTime)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '夏令时格式错误',
        'timeZone.summerFormatError',
      );
      return resp;
    }
    if (!timeZoneExp.test(params.winterTime)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '冬令时格式错误',
        'timeZone.winterFormatError',
      );
      return resp;
    }

    // TODO 后期判断如果修复时区名要判断是否有店铺使用
    if (!isNew && newTimeZone.timeZone !== oldTimeZone.timeZone) {
      // do something
    }

    // 再判断时区名有没有重复的逻辑
    const where: CheckTimeZone = {
      timeZone: params.timeZoneName
    };
    if (!isNew) {
      where._id = {
        $ne: params.id,
      };
    }

    const [errFind, count] = await Utils.toPromise(
      this.systemDataSchemaService.getTimeZoneDataModel().countDocuments(where),
    );
    if (errFind) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = errFind.message;
      return resp;
    }
    if (count > 0) {
      resp.code = CodeEnum.FAIL;
      resp.msg = this.globalService.serverLang(
        session,
        '时区({0})已重复',
        'timeZone.nameIsExists',
        params.timeZoneName,
      );
      return resp;
    }

    if (isCheck) {
      return resp;
    }

    if (isNew) {
      const createTimeZone = {
        timeZone: params.timeZoneName,
        summer: params.summerTime,
        winter: params.winterTime
      }
      const [errCreate, createObj] = await Utils.toPromise(
        this.systemDataSchemaService.getTimeZoneDataModel().create(createTimeZone),
      );
      if (errCreate) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errCreate.message;
        return resp;
      }
      resp.id = createObj.id;
      // 写日志...
    } else {
      await newTimeZone.save();
      resp.id = newTimeZone.id;
      // 写日志...
    }
    return resp;
  }

  async syncTimeZoneData(session: CmsSession) {
    // 同步默认时区数据到数据库中
    let syncSuccessNumber = 0;
    for (const timeZoneInfo of defaultTimeZone) {
      const [, result] = await Utils.toPromise(
        this.systemDataSchemaService.syncTimeZoneObject(
          <TimeZoneData>timeZoneInfo,
        ),
      );
      if (Utils.isEmpty(result)) {
        syncSuccessNumber++;
      }
    }
    if (syncSuccessNumber > 0) {
      const content = this.globalService.serverLang(
        session,
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
