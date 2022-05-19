import { Module } from '@nestjs/common';
import { TestConfigController } from './test.config.controller';

@Module({
  providers: [TestConfigController]
})
export class TestConfigModule {

}
