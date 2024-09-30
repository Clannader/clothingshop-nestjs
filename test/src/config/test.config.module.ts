import { Module } from '@nestjs/common';
import { TestConfigController } from './test.config.controller';
import { ConfigModule } from '@/common/modules';
import { join } from 'path';
import { TestConfigTokenController } from './test.config.token.controller';

@Module({
  imports: [
    ConfigModule.register({
      iniFilePath: join(__dirname, 'config.expand.ini'),
      token: 'TOKEN',
    }),
  ],
  controllers: [TestConfigController, TestConfigTokenController],
})
export class TestConfigModule {}
