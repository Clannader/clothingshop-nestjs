import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { AopLogger } from '../logger/AopLogger';
import { tap } from 'rxjs/operators';

export class LogInterceptor implements NestInterceptor {
  constructor(private aopLogger: AopLogger) {
    this.aopLogger.setContext('LogInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.aopLogger.log(
          `${request.method} ${request.url} ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
