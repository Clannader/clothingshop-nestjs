import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MemoryCacheModule } from '@/cache/module';
import { AdminSchemaModule } from '@/entities/module';
// import { ConfigModule } from '../common';
// import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // ConfigModule.register({
    //   envFilePath: './config/config2.ini',
    //   isWatch: true,
    //   token: 'TEST_CONFIG',
    // }),
    // UserModule,
    HttpModule.register({
      baseURL: 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'credential': 's:7xKqrkMLFpCmTsw9qm7iuoTiUTc8r5Y8.hXZECXxV88quNb9bERo9wVrQHnss2l5hSrcoSUvTNUI'
      }
    }),
    AdminSchemaModule,
    MemoryCacheModule,
  ],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
