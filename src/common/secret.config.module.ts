/**
 * Create by CC on 2023/6/28
 */
import { DynamicModule, Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, SECRET_CONFIG } from '@/common';

@Module({})
export class SecretConfigModule {
  private static configModule: DynamicModule; // 为了注册secret模块包变成单例模式
  static register(): DynamicModule {
    if (SecretConfigModule.configModule) {
      // 如果注册过就不需要再加载了
      return SecretConfigModule.configModule;
    }
    SecretConfigModule.configModule = ConfigModule.register({
      iniFilePath: join(process.cwd(), '/pem/secret.ini'),
      token: SECRET_CONFIG,
    });
    return SecretConfigModule.configModule;
  }
}
