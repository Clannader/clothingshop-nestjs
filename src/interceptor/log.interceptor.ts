import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { AopLogger } from '../logger';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new AopLogger();
  constructor() {
    this.logger.setContext(this.constructor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const now = Date.now();
    this.logger.log(`请求前:${request.method} ${request.url}`)
    return next.handle().pipe(
      tap(() => {
        // 测试发现这个拦截器是在执行业务之后,返回客户端时拦截的,而不是在请求前拦截的
        this.logger.log(
          `请求后:响应时间 ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
