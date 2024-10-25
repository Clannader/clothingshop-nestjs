/**
 * Create by oliver.wu 2024/10/24
 */
import { Module } from '@nestjs/common';
import Axios from 'axios';

import { TokenCacheModule } from '@/cache/modules';

import { LocalhostHttpService } from '../services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';

@Module({
  imports: [TokenCacheModule],
  providers: [
    LocalhostHttpService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios.create({
        baseURL: 'http://localhost:3000',
        timeout: 30 * 1000,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }),
    },
  ],
  exports: [LocalhostHttpService],
})
export class LocalhostHttpModule {}
