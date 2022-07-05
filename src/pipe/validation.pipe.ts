import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidateException } from '@/common';

@Injectable()
export class ValidationPipe<T> implements PipeTransform<T> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !ValidationPipe.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors: ValidationError[] = await validate(object);
    if (errors.length > 0) {
      // 如果报错,取第一个提示
      const constraints = errors[0].constraints;
      const content = constraints[Object.keys(constraints)[0]];
      throw new ValidateException(content);
    }
    return value;
  }

  private static toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
