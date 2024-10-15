/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { AdminLogSchemaService } from '@/entities/services';
import type { AdminLog } from '@/entities/schema';

import { LogTypeEnum } from '@/common/enum';

@Injectable()
export class UserLogsService {
  @Inject()
  private readonly adminLogSchemaService: AdminLogSchemaService;

  writeUserLog(content: string, type: LogTypeEnum) {
    const logInfo: AdminLog = {
      adminId: '22',
      adminName: '33',
      content,
      shopId: '44',
      type,
      traceId: '33',
    };
    return this.adminLogSchemaService.createUserLog(logInfo);
  }
}
