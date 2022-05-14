import { Injectable, Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from './config.constants';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';
import { ConfigServiceOptions } from './config.interface';
import { NoInferType, ExcludeUndefinedIf, KeyOf } from '../common.type';
import { Utils } from '../utils';
import { get } from 'lodash';

@Injectable()
export class ConfigService<
  K = Record<string, unknown>,
  WasValidated extends boolean = false,
> {
  private internalConfig: Record<string, any> = {};
  private envFilePath: string = resolve(process.cwd(), 'config.ini');

  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: ConfigServiceOptions,
  ) {
    this.envFilePath = options.envFilePath
      ? options.envFilePath
      : this.envFilePath;
    this.loadEnvFile();
    if (options.isWatch) {
      this.watchConfig();
    }
  }

  private loadEnvFile(): void {
    let config: ReturnType<typeof dotenv.parse> = {};
    if (fs.existsSync(this.envFilePath)) {
      config = Object.assign(
        dotenv.parse(fs.readFileSync(this.envFilePath)),
        config,
      );
    }
    this.internalConfig = config;
  }

  private watchConfig(): void {
    //触发这个要保存文件才能立刻触发,如果用Nodejs自动检测会很慢
    fs.watchFile(
      this.envFilePath,
      {
        persistent: true,
        interval: 1000,
      },
      (current, prev) => {
        if (current.mtime > prev.mtime) {
          this.loadEnvFile();
        }
      },
    );
  }

  get<T = any>(propertyPath: KeyOf<K>): ExcludeUndefinedIf<WasValidated, T>;
  get<T = any>(propertyPath: KeyOf<K>, defaultValue: NoInferType<T>): T;
  get<T = any>(propertyPath: KeyOf<K>, defaultValue?: T): T | undefined {
    const internalValue = this.getFromInternalConfig(propertyPath);
    if (!Utils.isUndefined(internalValue)) {
      return internalValue;
    }

    return defaultValue as T;
  }

  private getFromInternalConfig<T = any>(
    propertyPath: KeyOf<K>,
  ): T | undefined {
    const internalValue = get(this.internalConfig, propertyPath);
    return internalValue;
  }

  getInternalConfig() {
    return this.internalConfig;
  }
}
