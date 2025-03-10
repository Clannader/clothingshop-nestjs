/**
 * Create by oliver.wu 2025/2/27
 */
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from '@node-saml/passport-saml';
import * as fs from 'fs';
import { join } from 'path';
import { LoginResult, SECRET_CONFIG, SecurityOptions } from '@/common';
import { ConfigService } from '@/common/config';
import { UserService } from '@/user';
import { CodeEnum, LanguageEnum } from '@/common/enum';
import { ReqUserLoginDto } from '@/user/dto';
import { CodeException } from '@/common/exceptions';
import parseEnv from '@/lib/parseEnv';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  @Inject()
  private readonly userService: UserService;

  constructor(
    @Inject(SECRET_CONFIG)
    private readonly secretConfig: ConfigService,
  ) {
    // 这里的ts校验不通过,看以后如何处理
    // @ts-ignore
    super({
      callbackUrl: secretConfig.get<string>('callbackUrl'),
      entryPoint: secretConfig.get<string>('entryPoint'),
      issuer: secretConfig.get<string>('issuer'),
      idpCert: fs
        .readFileSync(
          join(parseEnv.getPemPath(), 'azure-ad-certificate.pem'),
          'utf-8',
        )
        .toString(),
      identifierFormat: null,
      validateInResponseTo: 'never', // 可使用值never, ifPresent, always
      disableRequestedAuthnContext: true,
      // forceAuthn: true, // 每次跳转都要重新验证
    });
  }

  async validate(profile: Profile): Promise<LoginResult> {
    // 在这里处理用户信息,微软认证通过后,返回用户信息到这里来
    const userEmail = profile.nameID; // 使用用户邮箱来判断用户
    const params = new ReqUserLoginDto();
    params.adminId = userEmail;
    params.ssoLogin = true;
    const securityOptions: SecurityOptions = {
      securityToken: '',
      securityId: '',
    };
    const result: LoginResult = await this.userService.userLogin(
      LanguageEnum.EN,
      params,
      securityOptions,
    );
    if (result.code !== CodeEnum.SUCCESS) {
      throw new CodeException(result.code, result.message);
    }
    return result;
  }
}
