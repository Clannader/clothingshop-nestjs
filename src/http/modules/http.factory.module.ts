/**
 * Create by oliver.wu 2024/10/25
 */
import { Module, Scope } from '@nestjs/common';

import { HttpServiceCacheModule } from '@/cache/modules';
import { ConfigService } from '@/common/config';
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
      useFactory: (config: ConfigService) => {
        // 连接池测试方案需要测2种情况
        // 1.工具并发100次,内部调用3-5个await不同请求
        // 2.工具发送1次,内部并发调用5-10个请求,如果是await的话,都是使用一个连接
        // 只有并发才能出现使用相同连接,并且需要使用单进程来测试,否则结果会不和预期一样
        const httpOptions: KeepAliveHttpAgent.HttpOptions = {
          maxSockets: config.get<number>('maxSockets', 100),
          maxFreeSockets: 10,
          freeSocketTimeout: 30 * 1000, // free socket keepalive for 30 seconds
          keepAlive: true,
        };
        const httpsOptions: KeepAliveHttpAgent.HttpsOptions = {
          ...httpOptions,
          rejectUnauthorized: false,
        };
        const httpAgent = new KeepAliveHttpAgent(httpOptions);
        const httpsAgent = new KeepAliveHttpAgent.HttpsAgent(httpsOptions);
        // 忘记如何测试tunnel的代理了...
        // 如果代理不通,可换成tunnel
        // const tunnelingAgent = tunnel.httpOverHttp({
        //   maxSockets: 100,
        //   maxFreeSockets: 10,
        //   keepAlive: true,
        //   proxy: {
        //     host: 'localhost',
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
      inject: [ConfigService],
    },
  ],
  exports: [HttpFactoryService],
})
export class HttpFactoryModule {}
