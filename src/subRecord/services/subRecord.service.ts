/**
 * Create by oliver.wu 2026/7/3
 */
import { Injectable, Inject } from '@nestjs/common';

import { TestSubRecordSchemaService } from '@/entities/services';
import {
  TestSubRecordDocument,
  NewTestSubRecordModel,
} from '@/entities/schema';
import {
  ReqSubRecordOrderListDto,
  RespSubRecordOrderListDto,
  SubRecordOrderListDto,
  ReqSubRecordCreateMasterDto,
  ReqSubRecordQueryMasterDto,
  RespSubRecordQueryMasterDto,
  SubRecordInfoMasterDto,
  ReqSubRecordModifyMasterDto,
  SubRecordMonitorDto,
  ReqSubRecordCreateMonitorDto,
  ReqSubRecordCreateOrderDto,
  ReqSubRecordModifyOrderDto,
  ReqSubRecordDeleteOrderDto,
} from '@/subRecord/dto';

import {
  CommonResult,
  RespErrorResult,
  RespModifyDataDto,
  RespModifySubDataDto,
} from '@/common';
import { CodeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

import * as moment from 'moment';

@Injectable()
export class SubRecordService {
  @Inject()
  private readonly testSubRecordSchemaService: TestSubRecordSchemaService;

  async getTestOrderList(params: ReqSubRecordOrderListDto) {
    const resp = new RespSubRecordOrderListDto();

    const [err, result] = await Utils.toPromise(
      this.testSubRecordSchemaService.getModel().find(),
    );
    if (err) {
      resp.code = CodeEnum.DB_EXEC_ERROR;
      resp.msg = err.message;
      return resp;
    }
    const orderList: SubRecordOrderListDto[] = [];
    for (const row of result) {
      const order = new SubRecordOrderListDto();
    }

    resp.orders = orderList;
    resp.code = CodeEnum.SUCCESS;

    return resp;
  }

  async createMasterDoc(params: ReqSubRecordCreateMasterDto) {
    const resp = new RespModifyDataDto();

    // 针对非子文档字段进行创建
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
    // 解决方案:1.请求中间件把$替换成_或者其他字符
    // 解决方案:2.使用mongoose的方法认为条件的合法性
    // 解决方案:3.校验请求参数的类型

    // 漏洞2:查询name=(?:56).*,可以查询出包含56的名字的数据
    // 解决方案:1.新增了正则表达式的转义
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
      item.createDate = moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss');
      item.updateDate = moment(row.updatedAt).format('YYYY-MM-DD HH:mm:ss');
      if (!Utils.isEmpty(row.monitor)) {
        const monitorInfo = new SubRecordMonitorDto();
        monitorInfo.maxOrders = row.monitor.maxOrders;
        monitorInfo.maxLogs = row.monitor.maxLogs;
        monitorInfo.intervalTime = row.monitor.intervalTime;
        // console.log(row.monitor.id) // 可以取虚拟id
        item.monitor = monitorInfo;
      }
      if (!Utils.isEmpty(row.orders)) {
        const orders: SubRecordOrderListDto[] = [];
        row.orders.forEach((order) => {
          const val = new SubRecordOrderListDto();
          val.productName = order.productName;
          val.quantity = order.quantity;
          val.price = order.price;
          val.id = order.id;
          orders.push(val);
        });
        item.orders = orders;
      }
      itemList.push(item);
    }

    resp.items = itemList;
    resp.code = CodeEnum.SUCCESS;
    return resp;
  }

  async modifyMasterDoc(params: ReqSubRecordModifyMasterDto) {
    const resp = new CommonResult();

    // 针对非子文档字段进行编辑
    const id = params.id;
    const oldMaster: TestSubRecordDocument =
      await this.testSubRecordSchemaService.getModel().saveFindById(id);
    if (Utils.isEmpty(oldMaster)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = '主文档不存在';
      return resp;
    }

    if (!Utils.isEmpty(params.name)) {
      oldMaster.name = params.name;
    }
    if (!Utils.isEmpty(params.phone)) {
      oldMaster.phone = params.phone;
    }

    await this.testSubRecordSchemaService
      .getModel()
      .syncSaveDBObject(oldMaster);

    return resp;
  }

  async createSubMonitorDoc(params: ReqSubRecordCreateMonitorDto) {
    const resp = new RespModifyDataDto();

    // const createMonitor = {
    //   maxOrders: params.maxOrders,
    //   maxLogs: params.maxLogs,
    //   intervalTime: params.intervalTime,
    // };

    const id = params.id;
    const oldMaster: TestSubRecordDocument =
      await this.testSubRecordSchemaService.getModel().saveFindById(id);
    if (Utils.isEmpty(oldMaster)) {
      resp.code = CodeEnum.FAIL;
      resp.msg = '主文档不存在';
      return resp;
    }

    // 方案1: 使用方案1新建主文档的时候必须要有monitor字段
    // 后期使用实例注入,把相同字段注入到对象中,不需要一个个字段set值
    // oldMaster.monitor.maxOrders = params.maxOrders;
    // oldMaster.monitor.maxLogs = params.maxLogs;
    // oldMaster.monitor.intervalTime = params.intervalTime;

    // 方案2: 使用方案2可以不必填monitor字段
    // 建议使用方案2,这样创建主文档的时候,这些子文档的节点无需自动创建
    // 并且子文档的字段必填校验也不会触发,业务触发创建时如果为空,也会触发子文档的文本校验逻辑
    const monitorObject = new NewTestSubRecordModel({
      monitor: {
        maxOrders: params.maxOrders,
        maxLogs: params.maxLogs,
        intervalTime: params.intervalTime,
      },
    });
    oldMaster.monitor = monitorObject.monitor;
    await this.testSubRecordSchemaService
      .getModel()
      .syncSaveDBObject(oldMaster);

    // 删除暂时这样吧,感觉也不是特别重要
    // await oldMaster.monitor.deleteOne() // 似乎没有效果
    // delete oldMaster.monitor // 这种也没有效果
    // 删除有2种方式
    // 1. 保留一个_id
    // const monitorObject = new NewTestSubRecordModel({monitor: {}});
    // oldMaster.monitor = monitorObject.monitor;
    // save()...

    // 2. 删除整个字段monitor
    // const monitorObject = new NewTestSubRecordModel({});
    // oldMaster.monitor = monitorObject.monitor; // or oldMaster.monitor = null
    // save()...

    resp.id = oldMaster.id;
    return resp;
  }

  async saveSubOrderDoc(params: ReqSubRecordModifyOrderDto, isNew: boolean) {
    const resp = new RespModifySubDataDto();

    return resp;
  }

  async deleteSubOrderDoc(params: ReqSubRecordDeleteOrderDto) {
    const resp = new RespErrorResult();

    return resp;
  }
}
