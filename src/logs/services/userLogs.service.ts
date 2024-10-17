/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { AdminLogSchemaService } from '@/entities/services';
import type { AdminLog, AdminLogDocument } from '@/entities/schema';

import { LogTypeEnum } from '@/common/enum';
import { CmsSession } from '@/common';

@Injectable()
export class UserLogsService {
  @Inject()
  private readonly adminLogSchemaService: AdminLogSchemaService;

  writeUserLog(
    session: CmsSession,
    type: LogTypeEnum,
    content: string,
    linkId: string[] = [],
  ) {
    const logInfo: AdminLog = {
      adminId: session.adminId,
      adminName: session.adminName,
      content,
      shopId: session.shopId,
      type,
      ...(linkId.length > 0 ? { linkId } : {}),
      traceId: Date.now().toString(), // TODO 以后需要修改这个traceId的逻辑,考虑pid+Date.now()??
    };
    return this.adminLogSchemaService.createUserLog(logInfo);
  }
}
