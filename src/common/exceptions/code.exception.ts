/**
 * Create by CC on 2022/7/19
 */
import { HttpException } from '@nestjs/common';

export class CodeException extends HttpException {
  constructor(
    code: number,
    description: string,
    objectOrError?: string | Record<string, any>,
  ) {
    super(HttpException.createBody(typeof objectOrError === 'string' ? objectOrError : JSON.stringify(objectOrError), description, code), code);
  }
}
