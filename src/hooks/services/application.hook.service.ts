/**
 * Create by oliver.wu 2024/11/6
 */
import {
  Injectable,
  Inject,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { SyncUpdateCacheService } from '@/cache/services';
import { ConfigService } from '@/common/config';

import * as moment from 'moment';

@Injectable()
export class ApplicationHookService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  @Inject()
  private readonly syncUpdateCacheService: SyncUpdateCacheService;

  @Inject()
  private readonly configService: ConfigService;

  onApplicationBootstrap(): any {
    this.syncUpdateCacheService.startListening();
    this.configService.set(
      'serverStartDate',
      moment().format('YYYY-MM-DD HH:mm:ss,SSS'),
    );
  }

  onApplicationShutdown(): any {
    this.configService.set(
      'serverShutdownDate',
      moment().format('YYYY-MM-DD HH:mm:ss,SSS'),
    );
  }
}
