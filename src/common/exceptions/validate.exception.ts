/**
 * Create by CC on 2022/7/5
 */
import { HttpException } from '@nestjs/common';
import { CodeEnum } from '../enum';

export class ValidateException extends HttpException {
  constructor(description: string, objectOrError?: string | object | any) {
    super(
      HttpException.createBody(objectOrError, description, CodeEnum.EXCEPTION),
      CodeEnum.EXCEPTION,
    );
  }
}
