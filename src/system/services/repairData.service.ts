/**
 * Create by oliver.wu 2024/9/19
 */
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class RepairDataService {
  repairBaseData() {}

  repairDBIndex() {}

  repairRightsGroup() {
    // 包括修复权限代码和默认权限组
  }

  doSelfCheck() {
    // 返回自检查结果集
  }
}
