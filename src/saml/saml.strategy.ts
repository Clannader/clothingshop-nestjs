/**
 * Create by oliver.wu 2025/2/27
 */
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@node-saml/passport-saml';
import { Profile, SamlOptions } from '@node-saml/node-saml/lib';
import * as fs from 'fs';
import { join } from 'path';
import { LoginResult, SECRET_CONFIG, SecurityOptions } from '@/common';
import { ConfigService } from '@/common/config';
import { UserService } from '@/user';
import { CodeEnum, LanguageEnum } from '@/common/enum';
import { ReqUserLoginDto } from '@/user/dto';
import parseEnv from '@/lib/parseEnv';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  @Inject()
  private readonly userService: UserService;

  constructor(
    @Inject(SECRET_CONFIG)
    private secretConfig: ConfigService,
  ) {
    let idpCert = ' ';
    let privateKey = '';
    let publicCert = '';
    const idpPath = join(parseEnv.getPemPath(), 'azure-ad-certificate.pem');
    const privatePath = join(parseEnv.getPemPath(), 'privateKey.pem');
    const publicPath = join(parseEnv.getPemPath(), 'certificate.pem');
    if (fs.existsSync(idpPath)) {
      idpCert = fs.readFileSync(idpPath, 'utf-8').toString();
    }
    if (fs.existsSync(privatePath)) {
      privateKey = fs.readFileSync(privatePath, 'utf-8').toString();
    }
    if (fs.existsSync(publicPath)) {
      publicCert = fs.readFileSync(publicPath, 'utf-8').toString();
    }
    // 这里的ts校验不通过,看以后如何处理
    // @ts-ignore
    super({
      callbackUrl: secretConfig.get<string>('callbackUrl'), // 设置为微软的Basic SAML Configuration -> Reply URL地址
      entryPoint: secretConfig.get<string>('entryPoint'), // 设置为微软的Set up XXX -> Login URL 登录地址
      issuer: secretConfig.get<string>('issuer'), // 有些时候需要加上spn:{{issuerID}}, Application ID
      idpCert, // 微软的SAML Certificates -> 下载证书
      // 如果authnContext为空并且设置disableRequestedAuthnContext=true,那么微软就会根据用户的授权方式进行授权,而不是每次都是
      // 使用密码来进行授权,微软的邮箱可以通过很多方式授权,每个账号可能都不一样,如果这里写死,那么就变成必须按照这种方式进行授权
      // 如果为空则根据用户的设置来进行授权
      // authnContext: [
      //   // 默认是 urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
      //   'urn:oasis:names:tc:SAML:2.0:ac:classes:Password',
      // ],
      signatureAlgorithm: 'sha256', // 签名算法,默认是sha256
      digestAlgorithm: 'sha256', // 摘要算法,默认是sha256
      ...(privateKey ? { privateKey } : {}),
      ...(publicCert ? { publicCert } : {}),
      // signMetadata: true,
      authnRequestBinding: 'HTTP-Redirect', // 默认为HTTP-Redirect, 如果设置HTTP-POST才可以带签名过去
      // identifierFormat: null, // 好像是解析SAML响应报文的用户邮箱格式,使用默认的即可
      // validateInResponseTo: 'never', // 可使用值never, ifPresent, always,这个好像是判断请求ID,使用缓存逻辑,用默认内置的代码即可
      disableRequestedAuthnContext: true, // 如果是真的话,就不需要特定的身份验证上下文
      wantAuthnResponseSigned: false, // 跳过响应xml签名验证,如果响应的xml没有签名可以跳过
      // wantAssertionsSigned: false, // 跳过断言xml签名验证
      // forceAuthn: true, // 每次跳转都要重新验证
    } as SamlOptions);
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
      // 如果想给前端一个友好的提示错误信息的话,确实需要返回一个结果,而不是抛出异常
      // 需要返回结果然后重定向到前端某个路由
      // throw new CodeException(result.code, result.message);
      result.errorMsg = {
        code: result.code,
        message: result.message,
      };
    }
    return result;
  }
}
