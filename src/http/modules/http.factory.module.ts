/**
 * Create by oliver.wu 2024/10/25
 */
import { Module } from '@nestjs/common';

import { TokenCacheModule } from '@/cache/modules';

import {
  HttpFactoryService,
  LocalhostHttpService,
  StagingHttpService,
  JwtHttpService,
} from '../services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';
import Axios from 'axios';
import * as keepAliveHttpAgent from 'agentkeepalive'

@Module({
  imports: [TokenCacheModule],
  providers: [
    HttpFactoryService,
    LocalhostHttpService,
    StagingHttpService,
    JwtHttpService,
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useFactory: () => {
        const httpOptions: keepAliveHttpAgent.HttpOptions = {
          maxSockets: 4,
          keepAlive: true,
        }
        const httpAgent = new keepAliveHttpAgent(httpOptions)
        const httpsAgent = new keepAliveHttpAgent.HttpsAgent(httpOptions)
        return Axios.create({
          httpAgent,
          httpsAgent,
          timeout: 30 * 1000,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
      },
    },
  ],
  exports: [HttpFactoryService],
})
export class HttpFactoryModule {}
