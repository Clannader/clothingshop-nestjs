/**
 * Create by oliver.wu 2026/7/6
 */
import { ExceptionFilter, Catch, ArgumentsHost, Inject } from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { MongooseError } from 'mongoose';
import { Request, Response } from 'express';
import { upperFirst } from 'lodash';
import { CodeEnum } from '@/common/enum';
import { GlobalService, Utils } from '@/common/utils';
import { AopLogger } from '@/logger';

@Catch(MongoServerError, MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  @Inject()
  private readonly globalService: GlobalService;

  private readonly logger = new AopLogger(MongoExceptionFilter.name);

  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let message = exception.message;
    if (process.env.NODE_ENV !== 'test') {
      this.logger.error(exception);
    }

    if (exception.code === 11000) {
      // E11000 duplicate key
      const field = Object.keys(exception.keyPattern).join(',');
      message = Utils.lang(
        Utils.getHeadersLanguage(request),
        message,
        'common.duplicateKey',
        field,
        JSON.stringify(exception.keyValue),
      );
    }
    response.status(200).json({
      code: CodeEnum.DB_EXEC_ERROR,
      msg: upperFirst(message),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
