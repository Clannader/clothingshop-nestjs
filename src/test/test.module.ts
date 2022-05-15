import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { ConfigModule } from '../common';
import { registerAs } from '../common/config/register-as.util';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule.register({
      envFilePath: './config/config2.ini',
      isWatch: true,
      factory: registerAs('TEST_CONFIG', () => ({mas: 'fd'})),
    }),
    UserModule
  ],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
