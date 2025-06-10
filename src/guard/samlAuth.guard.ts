/**
 * Create by oliver.wu 2025/5/30
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { RequestSession } from '@/common';

@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  getAuthenticateOptions(
    context: ExecutionContext,
  ): Promise<IAuthModuleOptions> | IAuthModuleOptions | undefined {
    const request: RequestSession = this.getRequest(context);
    // http:ip:port/sso/login?email=xxx
    return {
      additionalParams: {
        login_hint: request.query.email,
      },
    };
  }
}
