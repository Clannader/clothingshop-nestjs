import { DynamicModule, Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '../../src/common/config';

@Module({})
export class AppModule {
  static loadDefault(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
        }),
      ],
    };
  }

  static loadExpandVar(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.expand.ini'),
          expandVariables: true,
        }),
      ],
    };
  }
}
