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
} from '@/subRecord/dto';

import { CmsSession } from '@/common';
import { CodeEnum } from '@/common/enum';
import { Utils } from '@/common/utils';

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
    }

    resp.orders = orderList;
    resp.code = CodeEnum.SUCCESS;

    return resp;
  }
}
