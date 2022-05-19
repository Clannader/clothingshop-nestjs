import { DynamicModule, Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '../../../src/common/config';
import { TestConfigModule } from './test.config.module';
import { TestConfigTokenController } from './test.config.token.controller';
import { TestConfigController } from './test.config.controller';

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
          iniFilePath: join(__dirname, 'config.ini'),
        }),
      ],
    };
  }

  static watchIniFile(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config-watch.ini'),
          isWatch: true,
        }),
      ],
    };
  }

  static watchFalseIniFile(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
        }),
      ],
    };
  }

  // 还有一个token的令牌测试,需要测试全局实例化,全局后,可单独实例化,每一个实例都是单独的内存值,需要测试是否互相干扰
  static getGlobalIni(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
          isGlobal: true,
        }),
        TestConfigModule,
      ],
    };
  }

  static getTokenIni(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
          token: 'TOKEN',
        }),
      ],
      controllers: [TestConfigTokenController],
    };
  }

  static getTokenAndGlobal(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
          isGlobal: true,
        }),
        TestConfigModule,
      ],
      controllers: [TestConfigController],
    };
  }
}
