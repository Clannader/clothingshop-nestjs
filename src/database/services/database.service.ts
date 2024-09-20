/**
 * Create by oliver.wu 2024/9/20
 */
import { Injectable, Inject } from '@nestjs/common';

import { CommonResult } from '@/common/dto';

@Injectable()
export class DatabaseService {
  getDbStatistics() {
    const resp = new CommonResult();
    return resp;
  }

  getDbIndexList() {
    const resp = new CommonResult();
    return resp;
  }

  getDbDetails() {
    const resp = new CommonResult();
    return resp;
  }

  getDbLogs() {
    const resp = new CommonResult();
    return resp;
  }
}
