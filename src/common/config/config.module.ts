import { DynamicModule, Module, ClassProvider } from '@nestjs/common';
import { DotenvExpandOptions, expand } from 'dotenv-expand';
import { join } from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { isPlainObject } from 'lodash';
import { ConfigServiceOptions } from './config.interface';
import { ConfigService } from './config.service';
import {
  CONFIG_OPTIONS,
  CONFIG_ENV_TOKEN,
  CONFIG_SECRET,
} from './config.constants';
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
    if (Utils.isEmpty(options.envFilePath)) {
      options.ignoreEnvFile = true;
    }
    const envConfig = options.ignoreEnvFile ? {} : this.loadEnvFile(options);
    const secretConfig = this.loadSecretFile();
    this.assignVariablesToProcess(envConfig);
    const isToken = !Utils.isEmpty(options.token);
    const providers = [
      {
        provide: ConfigService,
        useClass: ConfigService,
      },
    ] as ClassProvider[];
    if (isToken) {
      providers.push({
        provide: options.token,
        useClass: ConfigService,
      });
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
        {
          provide: CONFIG_ENV_TOKEN,
          useValue: envConfig,
        },
        {
          provide: CONFIG_SECRET,
          useValue: secretConfig,
        },
        ...providers,
      ],
      exports: [ConfigService, CONFIG_SECRET, ...configProviderTokens], // 如果想外部使用secretConfig,就需要exports
    };
  }

  private static loadEnvFile(
    options: ConfigServiceOptions,
  ): Record<string, any> {
    const envFilePath = Utils.isEmpty(options.envFilePath)
      ? join(process.cwd(), '.env')
      : options.envFilePath;

    let config: Record<string, any> = {};
    if (fs.existsSync(envFilePath)) {
      config = Object.assign(
        dotenv.parse(fs.readFileSync(envFilePath)),
        config,
      );
      if (options.expandVariables) {
        const expandOptions: DotenvExpandOptions =
          typeof options.expandVariables === 'object'
            ? options.expandVariables
            : {};
        config = expand({ ...expandOptions, parsed: config }).parsed || config;
      }
    }
    return options.ignoreEnvVars
      ? config
      : {
          ...config,
          ...process.env,
        };
  }

  private static loadSecretFile(): Record<string, any> {
    const secretPath = join(process.cwd(), '/pem/secret.ini');
    let config: Record<string, any> = {};
    if (fs.existsSync(secretPath)) {
      config = Object.assign(dotenv.parse(fs.readFileSync(secretPath)), config);
    } else {
      // 如果pem目录不存在则创建一个目录
      const pemDir = join(process.cwd(), '/pem');
      if (!fs.existsSync(pemDir)) {
        fs.mkdirSync(pemDir);
      }
      fs.writeFileSync(secretPath, '');
    }
    return config;
  }

  private static assignVariablesToProcess(config: Record<string, any>) {
    if (!isPlainObject(config)) {
      return;
    }
    const keys = Object.keys(config).filter((key) => !(key in process.env));
    keys.forEach(
      (key) => (process.env[key] = (config as Record<string, any>)[key]),
    );
  }
}
