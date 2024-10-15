/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { AdminLogSchemaService } from '@/entities/services';
import type { AdminLog } from '@/entities/schema';

import { LogTypeEnum } from '@/common/enum';
import { CmsSession } from '@/common';

@Injectable()
export class UserLogsService {
  @Inject()
  private readonly adminLogSchemaService: AdminLogSchemaService;

  writeUserLog(session: CmsSession, type: LogTypeEnum, content: string) {
    const logInfo: AdminLog = {
      adminId: session.adminId,
      adminName: session.adminName,
      content,
      shopId: session.shopId,
      type,
      traceId: Date.now().toString(),
    };
    return this.adminLogSchemaService.createUserLog(logInfo);
  }
}
