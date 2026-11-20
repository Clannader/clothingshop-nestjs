/**
 * Create by oliver.wu 2025/5/30
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, AuthGuardAuthenticateOptions } from '@nestjs/passport';
import { RequestSession } from '@/common';

@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  getAuthenticateOptions(
    context: ExecutionContext,
  ):
    | Promise<AuthGuardAuthenticateOptions>
    | AuthGuardAuthenticateOptions
    | undefined {
    const request: RequestSession = this.getRequest(context);
    // http:ip:port/sso/login?email=xxx
    // [单点登录传参:第一步]暂时不知道能不能改变query,这里是拿/sso/login带回的query.version,设置到RelayState传给微软回调时取值
    // 微软目前已知的只能通过RelayState参数带回到回调时使用,如果是json,需要base64加密传输
    // request.query.RelayState = request.query.version;
    return {
      additionalParams: {
        login_hint: request.query.email, // 预填登录邮箱地址
        // whr: 'yourdomain.com' // Home Realm Discovery域提示：跳过域选择直达联合 IdP(按需)
      },
    };
  }
}
