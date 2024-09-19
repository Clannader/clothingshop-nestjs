/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';

import { CommonResult } from '@/common/dto';

@Injectable()
export class RepairDataService {
  repairBaseData() {
    const resp = new CommonResult()
    return resp;
  }

  repairDBIndex() {
    const resp = new CommonResult()
    return resp;
  }

  repairRightsGroup() {
    // 包括修复权限代码和默认权限组
    const resp = new CommonResult()
    return resp;
  }

  doSelfCheck() {
    // 返回自检查结果集
    const resp = new CommonResult()
    return resp;
  }
}
