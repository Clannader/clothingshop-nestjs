import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MemoryCacheModule } from '@/cache/modules';
import { AdminSchemaModule } from '@/entities/modules';
// import { ConfigModule } from '../common';
// import { UserModule } from '../user/user.module';

import { TestSchemaModule } from '@/entities/modules';

@Module({
  imports: [
    // ConfigModule.register({
    //   envFilePath: './config/config2.ini',
    //   isWatch: true,
    //   token: 'TEST_CONFIG',
    // }),
    // UserModule,
    TestSchemaModule,
    AdminSchemaModule,
    MemoryCacheModule,
  ],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
