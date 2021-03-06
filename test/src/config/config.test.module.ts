import { DynamicModule, Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@/common';
import { TestConfigModule } from './test.config.module';
import { TestConfigTokenController } from './test.config.token.controller';
import { TestConfigController } from './test.config.controller';

@Module({})
export class ConfigTestModule {
  static loadDefault(): DynamicModule {
    return {
      module: ConfigTestModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
        }),
      ],
    };
  }

  static loadExpandVar(): DynamicModule {
    return {
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
      module: ConfigTestModule,
      imports: [
        ConfigModule.register({
          iniFilePath: join(__dirname, 'config.ini'),
        }),
      ],
    };
  }

  // ????????????token???????????????,???????????????????????????,?????????,??????????????????,???????????????????????????????????????,??????????????????????????????
  static getGlobalIni(): DynamicModule {
    return {
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
      module: ConfigTestModule,
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
