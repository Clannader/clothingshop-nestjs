/**
 * Create by CC on 2022/8/9
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user';
import { tripleDES, ConfigService } from '@/common';
import { TokenCacheModule } from '@/cache';
import { TokenService } from './services';
import { GatewayAuthController, GatewaySystemController } from './controllers';
import { SystemModule } from '@/system';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: tripleDES.key, // 签发的秘钥
        signOptions: {
          expiresIn: config.get<number>('tokenExpires', 3600), // token有效期,单位秒
        },
      }),
      inject: [ConfigService],
    }),
    TokenCacheModule,
    SystemModule,
  ],
  controllers: [GatewayAuthController, GatewaySystemController],
  providers: [TokenService],
})
export class GatewayModule {}
