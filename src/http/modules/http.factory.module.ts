/**
 * Create by oliver.wu 2024/10/25
 */
import { Module } from '@nestjs/common';

import { TokenCacheModule } from '@/cache/modules';

import { HttpFactoryService, LocalhostHttpService } from '../services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';
import Axios from 'axios';

@Module({
  imports: [TokenCacheModule],
  providers: [
    HttpFactoryService,
    LocalhostHttpService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios.create({
        timeout: 30 * 1000,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }),
    },
  ],
  exports: [HttpFactoryService],
})
export class HttpFactoryModule{}