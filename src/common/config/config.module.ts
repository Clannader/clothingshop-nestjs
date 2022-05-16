import { DynamicModule, Module, ClassProvider } from '@nestjs/common';
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
    /**
     * 因为这里如果加载env的配置,需要在实例化ConfigService前就得读取文件了,否则不能生效
     */
    const isToken = !Utils.isEmpty(options.token);
    const providers = [
      {
        provide: ConfigService,
        useClass: ConfigService
      }
    ] as ClassProvider[];
    if (isToken) {
      providers.push({
        provide: options.token,
        useClass: ConfigService,
      })
    }
    const configProviderTokens = isToken ? [options.token] : [];
    return {
      module: ConfigModule,
      global: options.isGlobal,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        ...providers,
      ],
      exports: [ConfigService, ...configProviderTokens],
    };
  }
}
