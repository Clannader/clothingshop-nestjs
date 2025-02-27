/**
 * Create by oliver.wu 2025/2/27
 */
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from '@node-saml/passport-saml';
import * as fs from 'fs';
import { SECRET_CONFIG } from '@/common';
import { ConfigService } from '@/common/config';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    @Inject(SECRET_CONFIG)
    private readonly secretConfig: ConfigService,
  ) {
    // @ts-ignore
    super({
      callbackUrl: secretConfig.get<string>('callbackUrl'),
      entryPoint: secretConfig.get<string>('entryPoint'),
      issuer: secretConfig.get<string>('issuer'),
      idpCert: fs
        .readFileSync(
          secretConfig.getPemPath() + '/azure-ad-certificate.pem',
          'utf-8',
        )
        .toString(),
      identifierFormat: null,
      validateInResponseTo: 'always',
      disableRequestedAuthnContext: true,
      // forceAuthn: true, // 每次跳转都要重新验证
    });
  }

  async validate(profile: Profile): Promise<any> {
    // 在这里处理用户信息
    return profile;
  }
}
