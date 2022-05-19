import { Module } from '@nestjs/common';
import { TestConfigToken2Controller } from './test.config.token2.controller';
import { ConfigModule } from '../../../src/common/config';
import { join } from "path";

@Module({
  imports: [
    ConfigModule.register({
      iniFilePath: join(__dirname, 'config.expand.ini'),
      token: 'TOKEN'
    })
  ],
  controllers: [TestConfigToken2Controller]
})
export class TestConfig2Module {

}
