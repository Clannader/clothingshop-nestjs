import { Module } from '@nestjs/common';
import { TestConfigController } from './test.config.controller';

@Module({
  controllers: [TestConfigController]
})
export class TestConfigModule {

}
