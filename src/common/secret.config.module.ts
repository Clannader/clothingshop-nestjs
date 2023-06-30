/**
 * Create by CC on 2023/6/28
 */
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@/common/config';
import { join } from 'path';
import { SECRET_CONFIG } from '@/common/constants';

@Module({})
export class SecretConfigModule {
  static register(): DynamicModule {
    return ConfigModule.register({
      iniFilePath: join(process.cwd(), '/pem/secret.ini'),
      token: SECRET_CONFIG,
    })
  }
}
