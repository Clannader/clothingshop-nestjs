/**
 * Create by CC on 2022/8/9
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@/user';
import { SECRET_CONFIG } from '@/common';
import { SecretConfigModule } from 'src/common/modules';
import { ConfigService } from '@/common/config';
import { TokenCacheModule } from '@/cache/modules';
import { TokenService } from './services';
import { GatewayAuthController, GatewaySystemController } from './controllers';
import { SystemModule } from '@/system';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [SecretConfigModule.register()],
      useFactory: (config: ConfigService, secretConfig: ConfigService) => {
        return {
          secret: secretConfig.get<string>('jwtSecret'), // 签发的秘钥
          signOptions: {
            expiresIn: config.get<number>('tokenExpires', 3600), // token有效期,单位秒
          },
        };
      },
      inject: [ConfigService, SECRET_CONFIG], // useFactory的顺序和这里inject写的是一致的
    }),
    TokenCacheModule,
    SystemModule,
  ],
  controllers: [GatewayAuthController, GatewaySystemController],
  providers: [TokenService],
})
export class GatewayModule {}
