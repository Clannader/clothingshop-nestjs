/**
 * Create by CC on 2022/7/30
 */
import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  Injectable,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Builder } from 'xml2js';

const builder = new Builder();

@Injectable()
export class XmlInterceptor implements NestInterceptor {
  async intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((value) => {
        return builder.buildObject(value);
      }),
    );
  }
}
