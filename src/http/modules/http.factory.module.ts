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
import {
  AXIOS_INSTANCE_TOKEN,
  Localhost_Token,
  Staging_Token,
  Jwt_Token,
} from '../http.constants';
import Axios from 'axios';
import * as keepAliveHttpAgent from 'agentkeepalive';

@Module({
  imports: [TokenCacheModule],
  providers: [
    HttpFactoryService,
    {
      provide: Localhost_Token,
      useClass: LocalhostHttpService,
    },
    {
      provide: Staging_Token,
      useClass: StagingHttpService,
    },
    {
      provide: Jwt_Token,
      useClass: JwtHttpService,
    },
    {
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
