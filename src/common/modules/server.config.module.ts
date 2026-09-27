/**
 * Create by oliver.wu 2026/9/27
 */
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from './config.module';
import { GLOBAL_CONFIG } from '../constants';

@Module({
  imports: [
    ConfigModule.register({
      iniFilePath: join(process.cwd(), '/config/config_example.ini'),
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? join(process.cwd(), '/config/.env.development')
          : join(process.cwd(), '/config/.env.production'),
      isGlobal: true,
      isWatch: true,
      token: GLOBAL_CONFIG,
      // expandVariables: true, // 有bug,暂时去掉,原因是watch文件时,文件被修改了,没有检测到最新的值到内存里面
    }),
  ],
})
export class ServerConfigModule {}
