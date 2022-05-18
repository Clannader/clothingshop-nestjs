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
          iniFilePath: join(__dirname, 'config.ini'),
          isWatch: true
        }),
      ],
    };
  }

  // 还有一个token的令牌测试,需要测试全局实例化,全局后,可单独实例化,每一个实例都是单独的内存值,需要测试是否互相干扰
  // 测试一下useValue这个用法
}
