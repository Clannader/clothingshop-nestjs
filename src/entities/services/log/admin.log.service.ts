/**
 * Create by oliver.wu 2024/10/10
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { AdminLogModel, AdminLog } from '../../schema';
import { ConfigService } from '@/common/config';

// @ts-ignore
const cluster = require('node:cluster');

@Injectable()
export class AdminLogSchemaService {
  @InjectModel(AdminLog.name)
  private adminLogModel: AdminLogModel;

  @Inject()
  private configService: ConfigService;

  getModel() {
    return this.adminLogModel;
  }

  createUserLog(logInfo: AdminLog) {
    logInfo.serverName = this.configService.get<string>('serverName');
    logInfo.workerId = cluster?.worker?.id ?? 1;
    return this.adminLogModel.create(logInfo);
  }
}
