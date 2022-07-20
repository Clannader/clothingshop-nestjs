import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle();
  }
}
