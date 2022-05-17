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

  static loadEnvFile(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          envFilePath: join(__dirname, '.env'),
          expandVariables: true,
        }),
      ],
    };
  }

  static ignoreEnvVars(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          envFilePath: join(__dirname, '.env'),
          iniFilePath: join(__dirname, 'config.ini'),
          expandVariables: true,
          ignoreEnvVars: true,
        }),
      ],
    };
  }

  static ignoreEnvFile(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          envFilePath: join(__dirname, '.env'),
          iniFilePath: join(__dirname, 'config.ini'),
          ignoreEnvFile: true,
        }),
      ],
    };
  }

  static loadIniAndEnv(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          envFilePath: join(__dirname, '.env'),
        }),
      ],
    };
  }

  // 还有一个token的令牌测试
}
