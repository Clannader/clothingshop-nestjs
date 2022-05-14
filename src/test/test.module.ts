import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { ConfigModule } from '../common';
import { registerAs } from '../common/config/register-as.util';

@Module({
  imports: [
    ConfigModule.register({
      envFilePath: './config/config2.ini',
      isWatch: true,
      factory: registerAs('TEST_CONFIG', () => ({})),
    }),
  ],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
