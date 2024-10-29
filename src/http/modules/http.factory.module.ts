/**
 * Create by oliver.wu 2024/10/25
 */
import { Module, Scope } from '@nestjs/common';

import { HttpServiceCacheModule } from '@/cache/modules';

import {
  HttpFactoryService,
  JwtHttpService,
  LocalhostHttpService,
  StagingHttpService,
} from '../services';
import { AXIOS_INSTANCE_TOKEN } from '../http.constants';
import Axios from 'axios';
import * as keepAliveHttpAgent from 'agentkeepalive';

@Module({
  imports: [HttpServiceCacheModule],
  providers: [
    HttpFactoryService,
    LocalhostHttpService,
    StagingHttpService,
    JwtHttpService,
    {
      scope: Scope.TRANSIENT, // 每次注入时都是一个新的对象
      provide: AXIOS_INSTANCE_TOKEN,
      useFactory: () => {
        const httpOptions: keepAliveHttpAgent.HttpOptions = {
          maxSockets: 100, // TODO 后期可以通过config.ini配置
          keepAlive: true,
        };
        const httpAgent = new keepAliveHttpAgent(httpOptions);
        const httpsAgent = new keepAliveHttpAgent.HttpsAgent(httpOptions);
        return Axios.create({
          httpAgent,
          httpsAgent,
          timeout: 30 * 1000,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
      },
    },
  ],
  exports: [HttpFactoryService],
})
export class HttpFactoryModule {}
