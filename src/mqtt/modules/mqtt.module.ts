/**
 * Create by oliver.wu 2026/9/23
 */
import { Module, OnModuleDestroy } from '@nestjs/common';
import { MqttAbstractService, normalizeMqttConfig } from '../services';
import { ConfigService } from '@/common/config';
import { SecretConfigModule } from '@/common/modules';
import { SECRET_CONFIG, GLOBAL_CONFIG } from '@/common';
import cluster from 'node:cluster';

@Module({
  imports: [SecretConfigModule.register()],
  controllers: [],
  providers: [
    {
      provide: MqttAbstractService,
      inject: [GLOBAL_CONFIG, SECRET_CONFIG],
      useFactory: (
        configService: ConfigService,
        secretConfig: ConfigService,
      ) => {
        const workerId = cluster?.worker?.id ?? 1;
        const serverName = configService.get<string>('serverName');
        const clientId = secretConfig.get<string>('mqttClientId');
        const svc = new MqttAbstractService(
          normalizeMqttConfig({
            brokerUrl: configService.get<string>('mqttUrl'),
            username: secretConfig.get<string>('mqttUserName'),
            password: secretConfig.get<string>('mqttPassword'),
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
