import { Injectable, Inject } from '@nestjs/common';
// import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { resolve, join } from 'path';
import { get, set, unset, isPlainObject, forEach, cloneDeep } from 'lodash';
import { DotenvExpandOptions, expand } from 'dotenv-expand';
import { ConfigServiceOptions } from './config.interface';
// import { NoInferType, ExcludeUndefinedIf, KeyOf } from '../common.type';
import { Utils } from '../utils';
import {
  CONFIG_OPTIONS,
  CONFIG_ENV_TOKEN,
  CONFIG_SECRET,
} from './config.constants';

type ReturnValueOf = string | boolean | number;

@Injectable()
export class ConfigService {
  private internalConfig: Record<string, any> = {};
  private orgInternalConfig: Record<string, any> = {};
  private readonly iniFilePath: string = resolve(process.cwd(), 'config.ini');
  // private readonly envFilePath: string = resolve(process.cwd(), '.env');

  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: ConfigServiceOptions,
    @Inject(CONFIG_ENV_TOKEN) private readonly envConfig: Record<string, any>,
    @Inject(CONFIG_SECRET) private readonly secretConfig: Record<string, any>,
  ) {
    if (!Utils.isEmpty(options.iniFilePath)) {
      this.iniFilePath = options.iniFilePath;
    }
    // this.iniFilePath = Utils.isEmpty(options.iniFilePath)
    //   ? this.iniFilePath
    //   : options.iniFilePath;
    // this.envFilePath = Utils.isEmpty(options.envFilePath)
    //   ? this.envFilePath
    //   : options.envFilePath;
    this.loadIniFile();
    // this.loadEnvFile();
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
      // 由于上传ini文件后,下载下来的文件的换行符是\n,本地使用的是\r\n所以需要做个替换
      const orgIniConfig = this.parse(
        sourceString.replace(/(\r\n|\n|\r)/g, '\r\n'),
      );
      this.orgInternalConfig = cloneDeep(orgIniConfig);
      // if (!this.options.ignoreEnvVars) {
      //   config = Object.assign(orgIniConfig, this.envConfig);
      // } else {
      //   config = orgIniConfig;
      // }
      config = orgIniConfig;
      if (this.options.expandVariables) {
        const expandOptions: DotenvExpandOptions =
          typeof this.options.expandVariables === 'object'
            ? this.options.expandVariables
            : {};
        // 2022-06-08 真是又无语了,不知道为什么watch文件时,明明重新加载了,但是经过这个折叠方法
        // 之后,修改过的值还是旧值,只能暂时把这个参数关闭了
        config = expand({ ...expandOptions, parsed: config }).parsed || config;
      }
    }
    this.validateConfig(config);
    this.internalConfig = this.options.ignoreEnvVars
      ? config
      : {
          ...config,
          ...this.envConfig,
        };
  }

  private parse(
    src: string | Buffer,
    sep?: string,
    eq?: string,
  ): Record<string, any> {
    const obj = {},
      _sep = sep || '\r\n',
      _eq = eq || '=',
      // regex = new RegExp('^(.+)(?<!=)' + _eq + '(?!=)(.+)$'); // 由于部分配置进行了加密,正则需要匹配
      // regex = new RegExp(`^([^${_eq}.]+)${_eq}(.+)$`); // 由于部分配置进行了加密,正则需要匹配
      regex = new RegExp(`^([^${_eq}]+)${_eq}(.+)$`); // 修改去掉.,当内容为xx.js=xx时无法匹配,待测试
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
      obj[matches[1].trim()] = matches[2].trim();
    } else {
      obj['#' + i] = str;
    }
  }

  private static transformTypeof(value: string): ReturnValueOf {
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return +value;
    } else if (/^(true|false)$/.test(value)) {
      return value === 'true';
    } else {
      return value;
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

  get<ReturnValueOf = any>(propertyPath: string): ReturnValueOf;
  get<ReturnValueOf = any>(
    propertyPath: string,
    defaultValue: ReturnValueOf,
  ): ReturnValueOf;
  get<ReturnValueOf = any>(
    propertyPath: string,
    defaultValue?: ReturnValueOf,
  ): ReturnValueOf {
    const internalValue = get(this.internalConfig, propertyPath);
    if (!Utils.isUndefined(internalValue)) {
      return ConfigService.transformTypeof(
        internalValue,
      ) as unknown as ReturnValueOf;
    }

    return defaultValue as ReturnValueOf;
  }

  getSecurityConfig(propertyPath: string): string {
    const internalValue = get(this.internalConfig, propertyPath);
    const isSecurity = ConfigService.transformTypeof(
      get(this.internalConfig, 'security'),
    ) as boolean;
    return !Utils.isUndefined(internalValue) &&
      typeof isSecurity === 'boolean' &&
      isSecurity
      ? Utils.tripleDesDecrypt(
          internalValue,
          this.secretConfig['tripleKey'],
          this.secretConfig['tripleIv'],
        )
      : internalValue;
  }

  set(key: string, value: string | number | boolean) {
    if (Utils.isEmpty(key)) {
      return;
    }
    if (value == null || value === '') {
      unset(this.internalConfig, key);
      unset(this.orgInternalConfig, key);
    } else {
      set(
        this.internalConfig,
        key,
        Utils.replaceArgsFromJson(
          value + '',
          this.internalConfig,
          /\$\{[A-Za-z0-9\.\[\]]+\}/g,
        ),
      );
      set(this.orgInternalConfig, key, value);
    }
    if (this.options.isWatch) {
      fs.writeFileSync(this.iniFilePath, this.getMapToString());
    }
  }

  private getMapToString(sep?: string, eq?: string): string {
    const temp = [],
      _sep = sep || '\r\n',
      _eq = eq || '=';
    if (
      !isPlainObject(this.orgInternalConfig) ||
      Object.keys(this.orgInternalConfig).length === 0
    ) {
      return '';
    }

    forEach(this.orgInternalConfig, (value, key) => {
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

  // private loadEnvFile() {
  //   let config: Record<string, any> = {};
  //   if (fs.existsSync(this.envFilePath)) {
  //     config = Object.assign(
  //       // 其实用dotenv这个包就可以直接格式化数据,但是由于要重新写入文件,这样会丢失注释的内容,所以还是得自己来格式化了
  //       dotenv.parse(
  //         fs.readFileSync(this.envFilePath, {
  //           encoding: this.options.encoding || 'utf-8',
  //         }),
  //       ),
  //       config,
  //     );
  //   }
  //   if (!isPlainObject(config)) {
  //     return;
  //   }
  //   this.validateConfig(config);
  //   const keys = Object.keys(config).filter((key) => !(key in process.env));
  //   keys.forEach(
  //     (key) => (process.env[key] = (config as Record<string, any>)[key]),
  //   );
  // }

  private validateConfig(config: Record<string, any>): void {
    if (this.options.validate) {
      const validatedConfig = this.options.validate(config);
      // 到时候看看这个如何使用再说吧
      console.log(validatedConfig);
      // validatedEnvConfig = validatedConfig;
    } else if (this.options.validationSchema) {
      const validationOptions = ConfigService.getSchemaValidationOptions(
        this.options,
      );
      const { error, value: validatedConfig } =
        this.options.validationSchema.validate(config, validationOptions);

      if (error) {
        throw new Error(`Config validation error: ${error.message}`);
      }
      console.log(validatedConfig);
      // validatedEnvConfig = validatedConfig;
    }
  }

  private static getSchemaValidationOptions(options: ConfigServiceOptions) {
    if (options.validationOptions) {
      if (typeof options.validationOptions.allowUnknown === 'undefined') {
        options.validationOptions.allowUnknown = true;
      }
      return options.validationOptions;
    }
    return {
      abortEarly: false,
      allowUnknown: true,
    };
  }

  // 单独给这个INI设置一个方法获取
  getPemPath() {
    const pemPathIni = this.get<string>('pemPath');
    if (Utils.isEmpty(pemPathIni)) {
      return join(process.cwd(), 'pem');
    }
    return pemPathIni;
  }
}
