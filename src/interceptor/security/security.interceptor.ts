import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
  Inject,
} from '@nestjs/common';
import { LanguageType, RequestSession, SecurityOptions } from '@/common';
import { MemoryCacheService } from '@/cache/services';
import { Utils } from '@/common/utils';
import { map } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request: RequestSession = context.switchToHttp().getRequest();
    const isSecurityRequest = Utils.isHasSecurityHeader(request);
    return next.handle().pipe(
      map((value) => {
        if (isSecurityRequest) {
          const securityOptions: SecurityOptions = {
            securityToken: <string>request.headers['security-token'],
            securityId: <string>request.headers['security-id'],
          };
          const language: LanguageType = Utils.getHeadersLanguage(request);
          return this.memoryCacheService.tripleDesEncrypt(
            language,
            JSON.stringify(value),
            securityOptions,
          );
        }
        return value;
      }),
    );
  }
}
