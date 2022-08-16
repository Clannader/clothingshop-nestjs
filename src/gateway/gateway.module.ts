/**
 * Create by CC on 2022/8/9
 */
import { Module } from '@nestjs/common';
import { GatewayAuthController } from './gateway.auth.controller';
import { UserModule } from '@/user';
// import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { tripleDES, ConfigService } from '@/common';
import { TokenService } from './services';
import { MemoryCacheModule } from '@/cache';

@Module({
  imports: [
    UserModule,
    // PassportModule.registerAsync({}),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: tripleDES.key, // 签发的秘钥
        signOptions: {
          expiresIn: config.get<number>('tokenExpires', 3600), // token有效期,单位秒
        },
      }),
      inject: [ConfigService],
    }),
    MemoryCacheModule,
  ],
  controllers: [GatewayAuthController],
  providers: [TokenService],
})
export class GatewayModule {}
