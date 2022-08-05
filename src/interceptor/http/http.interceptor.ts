import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    // console.log('拦截器测试,由于代码搬到了守卫那边写,所以这个拦截器暂时没用');
    // console.log('需要查查当初在哪里看到的入参值可以赋默认值的写法');
    return next.handle();
  }
}
