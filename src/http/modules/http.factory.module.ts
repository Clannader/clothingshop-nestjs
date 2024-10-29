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
import * as KeepAliveHttpAgent from 'agentkeepalive';
import * as tunnel from 'tunnel';

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
        const httpOptions: KeepAliveHttpAgent.HttpOptions = {
          maxSockets: 100, // TODO 后期可以通过config.ini配置
          maxFreeSockets: 10,
          freeSocketKeepAliveTimeout: 30 * 1000, // free socket keepalive for 30 seconds
          keepAlive: true,
        };
        const httpsOptions: KeepAliveHttpAgent.HttpsOptions = {
          ...httpOptions,
          rejectUnauthorized: false,
        };
        const httpAgent = new KeepAliveHttpAgent(httpOptions);
        const httpsAgent = new KeepAliveHttpAgent.HttpsAgent(httpsOptions);
        // const tunnelingAgent = tunnel.httpOverHttp({
        //   proxy: {
        //     host: '10.3.8.50',
        //     port: 3000,
        //   }
        // })
        // console.log(tunnelingAgent)
        return Axios.create({
          httpAgent,
          httpsAgent,
          // 如果使用tunnel代理,需要配置下面2个配置
          // httpAgent: tunnelingAgent,
          // proxy: false,
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
