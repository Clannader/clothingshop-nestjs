/**
 * Create by CC on 2022/8/11
 */
import { CacheModule, Module } from '@nestjs/common';
import { ConfigService } from '@/common';


@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: (config: ConfigService) => ({

      }),
      inject: [ConfigService],
    })
  ]
})
export class MemoryCacheModule {}
