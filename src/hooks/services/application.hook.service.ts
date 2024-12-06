/**
 * Create by oliver.wu 2024/11/6
 */
import {
  Injectable,
  Inject,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@/common/config';

import * as moment from 'moment';

@Injectable()
export class ApplicationHookService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  @Inject()
  private readonly configService: ConfigService;

  onApplicationBootstrap(): any {
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
