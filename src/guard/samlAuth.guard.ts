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
    return {
      additionalParams: {
        login_hint: request.query.email, // 预填登录邮箱地址
        // whr: 'yourdomain.com' // Home Realm Discovery域提示：跳过域选择直达联合 IdP(按需)
      },
    };
  }
}
