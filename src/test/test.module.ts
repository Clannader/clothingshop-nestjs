import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MemoryCacheModule } from '@/cache';
import { AdminSchemaModule } from '@/entities';
// import { ConfigModule } from '../common';
// import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // ConfigModule.register({
    //   envFilePath: './config/config2.ini',
    //   isWatch: true,
    //   token: 'TEST_CONFIG',
    // }),
    // UserModule,
    AdminSchemaModule,
    MemoryCacheModule,
  ],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
