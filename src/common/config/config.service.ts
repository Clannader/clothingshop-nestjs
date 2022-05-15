import { Injectable, Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from './config.constants';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve } from 'path';
import { ConfigServiceOptions } from './config.interface';
import { NoInferType, ExcludeUndefinedIf, KeyOf } from '../common.type';
import { Utils } from '../utils';
import { get, set, unset, isPlainObject, forEach } from 'lodash';

@Injectable()
export class ConfigService<
  K = Record<string, unknown>,
  WasValidated extends boolean = false,
> {
  private internalConfig: Record<string, any> = {};
  private readonly iniFilePath: string = resolve(process.cwd(), 'config.ini');
  private readonly envFilePath: string = resolve(process.cwd(), '.env');

  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: ConfigServiceOptions,
  ) {
    this.iniFilePath = Utils.isEmpty(options.iniFilePath)
      ? this.iniFilePath
      : options.iniFilePath;
    this.envFilePath = Utils.isEmpty(options.envFilePath)
      ? this.envFilePath
      : options.envFilePath;
    this.loadIniFile();
    this.loadEnvFile();
    if (options.isWatch) {
      this.watchConfig();
    }
  }

  private loadIniFile(): void {
    let config: Record<string, any> = {};
    if (fs.existsSync(this.iniFilePath)) {
      // config = Object.assign(
      //   // 其实用dotenv这个包就可以直接格式化数据,但是由于要重新写入文件,这样会丢失注释的内容,所以还是得自己来格式化了
      //   // dotenv.parse(fs.readFileSync(this.iniFilePath)),
      //   config,
      // );
      const sourceString = fs.readFileSync(this.iniFilePath, {
        encoding: this.options.encoding || 'utf-8',
      });
      config = Object.assign(this.parse(sourceString));
    }
    this.validateConfig(config);
    this.internalConfig = config;
  }

  private parse(
    src: string | Buffer,
    sep?: string,
    eq?: string,
  ): Record<string, any> {
    const obj = {},
      _sep = sep || '\r\n',
      _eq = eq || '=',
      regex = new RegExp('^(.+)(?<!=)' + _eq + '(?!=)(.+)$'); // 由于部分配置进行了加密,正则需要匹配
    // 第一个等号的分隔
    const qs = src.toString();
    if (qs.length === 0) {
      return obj;
    }
    const strArray = qs.split(_sep);
    strArray.forEach((value, index) => {
      ConfigService.parseRows(obj, regex, index, value);
    });

    return obj;
  }

  private static parseRows(
    obj: Record<string, any>,
    regex: RegExp,
    i: number,
    str: string,
  ): void {
    const matches = str.match(regex);
    if (matches) {
      const value = matches[2].trim();
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        obj[matches[1].trim()] = parseFloat(value);
      } else if (/^(true|false)$/.test(value)) {
        obj[matches[1].trim()] = value === 'true';
      } else {
        obj[matches[1].trim()] = value;
      }
    } else {
      obj['#' + i] = str;
    }
  }

  private watchConfig(): void {
    //触发这个要保存文件才能立刻触发,如果用Nodejs自动检测会很慢
    if (fs.existsSync(this.iniFilePath)) {
      fs.watchFile(
        this.iniFilePath,
        {
          persistent: true,
          interval: 1000,
        },
        (current, prev) => {
          if (current.mtime > prev.mtime) {
            this.loadIniFile();
          }
        },
      );
    }
  }

  get<T = any>(propertyPath: KeyOf<K>): ExcludeUndefinedIf<WasValidated, T>;
  get<T = any>(propertyPath: KeyOf<K>, defaultValue: NoInferType<T>): T;
  get<T = any>(propertyPath: KeyOf<K>, defaultValue?: T): T | undefined {
    const internalValue = get(this.internalConfig, propertyPath);
    if (!Utils.isUndefined(internalValue)) {
      return internalValue;
    }

    return defaultValue as T;
  }

  getSecurityConfig(propertyPath: string): string {
    const internalValue = get(this.internalConfig, propertyPath);
    const isSecurity = get(this.internalConfig, 'security');
    return !Utils.isUndefined(internalValue) && (typeof isSecurity === 'boolean' && isSecurity)
      ? Utils.tripleDESdecrypt(internalValue)
      : internalValue;
  }

  set(key: string, value: string | number | boolean) {
    if (Utils.isEmpty(key)) {
      return;
    }
    if (value == null || value === '') {
      unset(this.internalConfig, key);
    } else {
      set(this.internalConfig, key, value);
    }
    fs.writeFileSync(this.iniFilePath, this.getMapToString());
  }

  private getMapToString(sep?: string, eq?: string): string {
    const temp = [],
      _sep = sep || '\r\n',
      _eq = eq || '=';
    if (
      !isPlainObject(this.internalConfig) ||
      Object.keys(this.internalConfig).length === 0
    ) {
      return '';
    }

    forEach(this.internalConfig, (value, key) => {
      if (!Utils.isEmpty(value)) {
        if (/^#\d+$/.test(key)) {
          temp.push(value); //-->value\r\n
        } else {
          temp.push(key + _eq + value); //-->key=value\r\n
        }
      }
    });

    return temp.join(_sep);
  }

  // private getFromInternalConfig<T = any>(
  //   propertyPath: KeyOf<K>,
  // ): T | undefined {
  //   return get(this.internalConfig, propertyPath);
  // }

  getInternalConfig() {
    return this.internalConfig;
  }

  private loadEnvFile() {
    let config: Record<string, any> = {};
    if (fs.existsSync(this.envFilePath)) {
      config = Object.assign(
        // 其实用dotenv这个包就可以直接格式化数据,但是由于要重新写入文件,这样会丢失注释的内容,所以还是得自己来格式化了
        dotenv.parse(fs.readFileSync(this.envFilePath, {
          encoding: this.options.encoding || 'utf-8',
        })),
        config,
      );
    }
    if (!isPlainObject(config)) {
      return;
    }
    this.validateConfig(config);
    const keys = Object.keys(config).filter(key => !(key in process.env));
    keys.forEach(
      key => (process.env[key] = (config as Record<string, any>)[key]),
    );
  }

  private validateConfig(config: Record<string, any>): void {
    // TODO
  }
}
