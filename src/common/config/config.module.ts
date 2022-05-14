import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigServiceOptions } from './config.interface'
import { CONFIG_OPTIONS } from './config.constants';

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ConfigModule {
  static register(options: ConfigServiceOptions = {}): DynamicModule {
    return {
      module: ConfigModule,
      global: options.isGlobal,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        ConfigService
      ],
      exports: [ConfigService],
    };
  }
}
