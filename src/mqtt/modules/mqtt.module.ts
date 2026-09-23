/**
 * Create by oliver.wu 2026/9/23
 */
import { Module, OnModuleDestroy } from '@nestjs/common';
import { MqttAbstractService, normalizeMqttConfig } from '../services';
import { ConfigService } from '@/common/config';
import { SecretConfigModule } from '@/common/modules';

@Module({
  imports: [SecretConfigModule.register()],
  controllers: [],
  providers: [
    {
      provide: MqttAbstractService,
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
        secretConfig: ConfigService,
      ) => {
        const svc = new MqttAbstractService(
          normalizeMqttConfig({
            brokerUrl: configService.get<string>('mqttUrl'),
            username: secretConfig.get<string>('mqttUserName'),
            password: secretConfig.get<string>('mqttPassword'),
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
