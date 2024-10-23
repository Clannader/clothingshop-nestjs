/**
 * Create by oliver.wu 2024/10/15
 */
import { Injectable, Inject } from '@nestjs/common';

import { AdminLogSchemaService } from '@/entities/services';
import type { AdminLog } from '@/entities/schema';

import { LogTypeEnum } from '@/common/enum';
import { CmsSession } from '@/common';
import { TraceIdCacheService } from '@/cache/services';

type LinkIdObj = {
  linkId?: string[];
};

@Injectable()
export class UserLogsService {
  @Inject()
  private readonly adminLogSchemaService: AdminLogSchemaService;

  @Inject()
  private readonly traceIdCacheService: TraceIdCacheService;

  async writeUserLog(
    session: CmsSession,
    type: LogTypeEnum,
    content: string,
    linkId: Array<string> | string = [],
  ) {
    // linkId定义Array<string>或者string[],数据库字段type: Array时,如果传入any类型,实际上是字符串,则会以字符串存储
    // linkId定义Array<string>或者string[],数据库字段type: [String]时,如果传入any类型,实际上是字符串,则会以数组存储
    // 但是为了能准确表达传入的类型和存储类型正确,定义Array<string> | string
    const linkIdObj: LinkIdObj = {};
    if (linkId.length > 0) {
      if (Array.isArray(linkId)) {
        linkIdObj.linkId = linkId;
      } else if (typeof linkId === 'string') {
        linkIdObj.linkId = [linkId];
      }
    }
    const logInfo: AdminLog = {
      adminId: session.adminId,
      adminName: session.adminName,
      content,
      shopId: session.shopId,
      type,
      ...linkIdObj,
      traceId: await this.traceIdCacheService.getTraceIdCache(session),
    };
    return this.adminLogSchemaService.createUserLog(logInfo);
  }
}
