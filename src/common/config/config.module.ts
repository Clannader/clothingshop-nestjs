import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigServiceOptions } from './config.interface';
import { CONFIG_OPTIONS } from './config.constants';
import { Utils } from '../utils';

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ConfigModule {
  static register(options: ConfigServiceOptions = {}): DynamicModule {
    const isToken = !Utils.isEmpty(options.token);
    const providers = isToken
      ? [
          {
            provide: options.token,
            useClass: ConfigService,
          },
        ]
      : [];
    const configProviderTokens = isToken ? [options.token] : [];
    return {
      module: ConfigModule,
      global: options.isGlobal,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        ConfigService,
        ...providers,
      ],
      exports: [ConfigService, ...configProviderTokens],
    };
  }
}
