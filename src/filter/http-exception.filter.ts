import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  // HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CodeEnum } from '@/common/enum';
import { ValidateException } from '@/common/exceptions';
import { GlobalService, Utils } from '@/common/utils';
import { upperFirst } from 'lodash';

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  @Inject()
  private readonly globalService: GlobalService;

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : CodeEnum.UNKNOWN;
    const message = exception.message;
    if (process.env.NODE_ENV !== 'test') {
      console.error(exception.stack);
    }
    const msg =
      exception instanceof ValidateException
        ? Utils.lang(Utils.getHeadersLanguage(request), message, message)
        : message;
    response.status(200).json({
      code: status,
      msg: upperFirst(msg),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
