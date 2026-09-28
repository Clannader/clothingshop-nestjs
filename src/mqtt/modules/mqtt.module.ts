/**
 * Create by oliver.wu 2026/9/23
 */
import { Module, OnModuleDestroy } from '@nestjs/common';
import { MqttAbstractService, normalizeMqttConfig } from '../services';
import { MqttController } from '../controllers';
import { ConfigService } from '@/common/config';
import { GLOBAL_CONFIG } from '@/common';
import cluster from 'node:cluster';

@Module({
  controllers: [MqttController],
  providers: [
    {
      provide: MqttAbstractService,
      // inject: [GLOBAL_CONFIG, SECRET_CONFIG],
      inject: [GLOBAL_CONFIG],
      useFactory: (configService: ConfigService) => {
        const workerId = cluster?.worker?.id ?? 1;
        const serverName = configService.get<string>('serverName');
        const clientId = configService.get<string>('mqttClientId');
        const svc = new MqttAbstractService(
          normalizeMqttConfig({
            brokerUrl: configService.get<string>('mqttUrl'),
            username: configService.get<string>('mqttUserName'),
            password: configService.get<string>('mqttPassword'),
            clientId: `${clientId}-${serverName}-${workerId}`, // clientId就是连接的名称,如果不设置就是随机
          }),
        );
        svc.start();
        return svc;
      },
    },
  ],
})
export class MqttModule implements OnModuleDestroy {
  constructor(private readonly mqttService: MqttAbstractService) {}

  onModuleDestroy(): void {
    this.mqttService.stop();
  }
}
