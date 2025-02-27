/**
 * Create by oliver.wu 2025/2/27
 */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SamlStrategy } from './saml.strategy';
import { SamlAuthController } from './saml.auth.controller';
import { SecretConfigModule } from '@/common/modules';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    SecretConfigModule.register(),
  ],
  providers: [SamlStrategy],
  controllers: [SamlAuthController],
})
export class SamlAuthModule {}
