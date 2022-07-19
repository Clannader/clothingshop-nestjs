import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GlobalService, ValidateException } from '@/common';

@Catch(HttpException)
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
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;
    response.status(200).json({
      code: status,
      msg:
        exception instanceof ValidateException
          ? this.globalService.lang(
              this.globalService.getHeadersLanguage(request),
              message,
              message,
            )
          : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
