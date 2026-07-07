/**
 * Create by oliver.wu 2026/7/3
 */
import { Injectable, Inject } from '@nestjs/common';

import { TestSubRecordSchemaService } from '@/entities/services';
import type { TestSubRecord } from '@/entities/schema';
import {
  ReqSubRecordListDto,
  RespSubRecordListDto,
  SubRecordListDto,
  ReqSubRecordCreateMasterDto,
  ReqSubRecordQueryMasterDto,
  RespSubRecordQueryMasterDto,
  SubRecordInfoMasterDto,
  ReqSubRecordModifyMasterDto,
} from '@/subRecord/dto';

import { CmsSession, CommonResult, RespModifyDataDto } from '@/common';
import { CodeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

import * as moment from 'moment';

@Injectable()
export class SubRecordService {
  @Inject()
  private readonly testSubRecordSchemaService: TestSubRecordSchemaService;

  async getTestOrderList(params: ReqSubRecordListDto) {
    const resp = new RespSubRecordListDto();

    const [err, result] = await Utils.toPromise(
      this.testSubRecordSchemaService.getModel().find(),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const orderList: SubRecordListDto[] = [];
    for (const row of result) {
      const order = new SubRecordListDto();
    }

    resp.orders = orderList;
    resp.code = CodeEnum.SUCCESS;

    return resp;
  }

  async createMasterDoc(params: ReqSubRecordCreateMasterDto) {
    const resp = new RespModifyDataDto();

    const createMaster = {
      name: params.name,
      phone: params.phone,
    };

    // 新增全局拦截Mongodb异常,不用每个地方都单独处理,除非逻辑上需要改变
    const newRecord = await this.testSubRecordSchemaService
      .getModel()
      .create(createMaster);

    resp.id = newRecord.id;
    return resp;
  }

  async getMasterList(params: ReqSubRecordQueryMasterDto) {
    const resp = new RespSubRecordQueryMasterDto();

    // 漏洞1:name={$ne:''}这种NoSQL的漏洞查询
    // 漏洞2:查询name=(?:56).*,可以查询出包含56的名字的数据
    const where: Record<string, any> = {};
    if (!Utils.isEmpty(params.name)) {
      where.name = Utils.getIgnoreCase(params.name, true);
    }
    if (!Utils.isEmpty(params.phone)) {
      where.phone = Utils.getIgnoreCase(params.phone, true);
    }

    const result = await this.testSubRecordSchemaService.getModel().find(where);

    const itemList: SubRecordInfoMasterDto[] = [];
    for (const row of result) {
      const item = new SubRecordInfoMasterDto();
      item.id = row.id;
      item.name = row.name;
      item.phone = row.phone;
      item.createDate = moment(row['createdAt']).format('YYYY-MM-DD HH:mm:ss');
      item.updateDate = moment(row['updatedAt']).format('YYYY-MM-DD HH:mm:ss');
      itemList.push(item);
    }

    resp.items = itemList;
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  async modifyMasterDoc(params: ReqSubRecordModifyMasterDto) {
    const resp = new CommonResult();
    return resp;
  }
}
