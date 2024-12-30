import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MemoryCacheModule } from '@/cache/modules';
import {
  AdminSchemaModule,
  SystemDataSchemaModule,
  SequenceSchemaModule,
} from '@/entities/modules';
// import { ConfigModule } from '../common';
// import { UserModule } from '../user/user.module';
import { TestService } from './test.service';
import { AnimalFactoryModule } from './abstract';
import { HttpFactoryModule } from '@/http';
import { TokenCacheModule, SecuritySessionCacheModule } from '@/cache/modules';
import { TestInterfacesModule } from './interfaces';
import { BoxController } from './box.controller';

@Module({
  imports: [
    // ConfigModule.register({
    //   envFilePath: './config/config2.ini',
    //   isWatch: true,
    //   token: 'TEST_CONFIG',
    // }),
    // UserModule,
    SequenceSchemaModule,
    AdminSchemaModule,
    MemoryCacheModule,
    SystemDataSchemaModule,
    AnimalFactoryModule,
    HttpFactoryModule,
    TokenCacheModule,
    TestInterfacesModule,
    SecuritySessionCacheModule,
  ],
  controllers: [TestController, BoxController],
  providers: [TestService],
})
export class TestModule {}
