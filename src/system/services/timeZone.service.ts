/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';
import { instanceToInstance } from 'class-transformer';

import { CommonResult, DeleteResultDto, RespErrorResult } from '@/common/dto';
import { GlobalService, Utils } from '@/common/utils';
import { CodeEnum, LogTypeEnum } from '@/common/enum';
import { CmsSession, timeZoneExp } from '@/common';

import {
  DeleteLogSchemaService,
  SystemDataSchemaService,
} from '@/entities/services';
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
  timeZone: string;
  _id?: {
    $ne: string;
  };
};

@Injectable()
export class TimeZoneService {
  @Inject()
  private readonly systemDataSchemaService: SystemDataSchemaService;

  @Inject()
  private readonly userLogsService: UserLogsService;

  @Inject()
  private readonly deleteLogSchemaService: DeleteLogSchemaService;

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
        description: row.description,
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

    const modelName = this.systemDataSchemaService
      .getTimeZoneDataModel()
      .getAliasName();
    for (const timeZoneObj of timeZoneList) {
      await timeZoneObj.deleteOne();
      writeLogResult.push(timeZoneObj.timeZone);
      deleteTimeZoneId.push(timeZoneObj.id);
      await this.deleteLogSchemaService.createDeleteLog({
        modelName,
        keyWords: timeZoneObj.timeZone,
        searchWhere: {
          timeZone: timeZoneObj.timeZone,
        },
        id: timeZoneObj.id,
      });
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

      if (!Utils.isEmpty(params.description)) {
        newTimeZone.description = params.description;
      } else {
        params.description = oldTimeZone.description;
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
      timeZone: params.timeZoneName,
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
        winter: params.winterTime,
        description: params.description,
        createUser: session.adminId,
        createDate: new Date(),
      };
      const [errCreate, createObj] = await Utils.toPromise(
        this.systemDataSchemaService
          .getTimeZoneDataModel()
          .create(createTimeZone),
      );
      if (errCreate) {
        resp.code = CodeEnum.DB_EXEC_ERROR;
        resp.msg = errCreate.message;
        return resp;
      }
      resp.id = createObj.id;
      // 写日志...
      // 这里写日志考虑几个问题
      // 1.可以查看某个表的修改记录,使用linkId关联查询,应该不需要记录哪个表,如果记录删除,确实无法查看 √
      // 2.如果多条修改合成一条修改记录则linkId存多个即可 √
      // 3.考虑一个业务产生的日志链问题,把请求和日志关联起来,可查看某个请求产生了多少日志
      // 4.新建日志是否记录整个对象到数据库中??以后可以查看对象的生命周期的修改记录 √ 不考虑
      // 5.删除记录是否另存一个表,这样可以通过这个表寻找被删的记录的linkId √
      const content = this.globalService.serverLang(
        session,
        '新建时区:({0})',
        'timeZone.createLog',
        createObj.timeZone,
      );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.TimeZone,
        content,
        createObj.id,
      );
    } else {
      newTimeZone.updateUser = session.adminId;
      newTimeZone.updateDate = new Date();
      if (newTimeZone.summer === '+01:00') {
        await Utils.sleep(3 * 1000);
      }
      await this.systemDataSchemaService
        .getSystemDataModel()
        .syncSaveDBObject(newTimeZone);
      // await this.systemDataSchemaService.syncSaveTimeZoneObject(newTimeZone);
      resp.id = newTimeZone.id;
      // 写日志...
      const contentArray = [
        this.globalService.serverLang(
          session,
          '编辑时区:({0})',
          'timeZone.modifiedLog',
          newTimeZone.timeZone,
        ),
      ];
      contentArray.push(
        ...this.globalService.compareObjectWriteLog(
          session,
          TimeZoneData,
          oldTimeZone,
          newTimeZone,
        ),
      );
      if (contentArray.length > 1) {
        await this.userLogsService.writeUserLog(
          session,
          LogTypeEnum.TimeZone,
          contentArray.join('\r\n'),
          newTimeZone.id,
        );
      }
    }
    return resp;
  }

  async syncTimeZoneData(session: CmsSession) {
    // 同步默认时区数据到数据库中
    const successTimeZone: string[] = [];
    for (const timeZoneInfo of defaultTimeZone) {
      const saveTimeZone: TimeZoneData = <TimeZoneData>timeZoneInfo;
      saveTimeZone.createUser = 'SYSTEM';
      saveTimeZone.createDate = new Date();
      const [, result] = await Utils.toPromise(
        this.systemDataSchemaService.syncTimeZoneObject(saveTimeZone),
      );
      // 这里可以设置每次都返回更新后的文档,但是之前的需求是只想第一次新建时返回
      // 后期已存在数据时不想返回,为了体现每次修复实际更新几个数据
      // 如果设置了,就会导致每次都有返回,每次都写日志
      // 其实考虑实际每次都写日志也算是正常的
      successTimeZone.push(result.id);
    }
    if (successTimeZone.length > 0) {
      const content = this.globalService.serverLang(
        session,
        '成功同步{0}条默认时区数据',
        'timeZone.syncSuccess',
        successTimeZone.length,
      );
      await this.userLogsService.writeUserLog(
        session,
        LogTypeEnum.TimeZone,
        content,
        successTimeZone,
      );
    }
    return new CommonResult();
  }
}
