/**
 * Create by CC on 2022/7/19
 */
import { HttpException } from '@nestjs/common';

export class CodeException extends HttpException {
  constructor(
    code: number,
    description: string,
    objectOrError?: string | object | any,
  ) {
    super(HttpException.createBody(objectOrError, description, code), code);
  }
}
