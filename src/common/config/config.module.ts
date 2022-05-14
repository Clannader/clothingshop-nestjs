import { DynamicModule, Module, FactoryProvider } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigServiceOptions } from './config.interface';
import { CONFIG_OPTIONS } from './config.constants';
import { ConfigFactory } from './config.types';
import { createConfigProvider } from './create-config-factory.util';
import { ConfigFactoryKeyHost } from './register-as.util';

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ConfigModule {
  static register(options: ConfigServiceOptions = {}): DynamicModule {
    const providers = options.factory
      ? [createConfigProvider(options.factory as ConfigFactory & ConfigFactoryKeyHost)] as FactoryProvider[]
      : [];
    console.log(providers)
    const configProviderTokens = providers.map(item => item.provide);
    return {
      module: ConfigModule,
      global: options.isGlobal,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        ConfigService,
        ...providers
      ],
      exports: [ConfigService, ...configProviderTokens],
    };
  }

  static forFeature(config: ConfigFactory): DynamicModule {
    const configProvider = createConfigProvider(
      config as ConfigFactory & ConfigFactoryKeyHost,
    );
    const serviceProvider = {
      provide: ConfigService,
      useFactory: (configService: ConfigService) => configService,
      inject: [configProvider.provide],
    };

    return {
      module: ConfigModule,
      providers: [
        configProvider,
        serviceProvider,
      ],
      exports: [ConfigService, configProvider.provide],
    };
  }
}
