import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidateException } from '@/common/exceptions';
import { has, get, forEach } from 'lodash';

@Injectable()
export class ValidationPipe<T> implements PipeTransform<T> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !ValidationPipe.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value, {
      excludeExtraneousValues: true,
    });
    const errors: ValidationError[] = await validate(object);
    if (errors.length > 0) {
      // 如果报错,取第一个提示
      // 发现不能直接取第一个做提示,因为有多个错误时,返回的第一个并不是想要的那个提示语
      // 所以这里需要做一个优先级的提示判断
      const constraints = errors[0].constraints;
      throw new ValidateException(ValidationPipe.getErrorContent(constraints));
    }
    return object;
  }

  private static toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private static getErrorContent(constraints: {
    [type: string]: string;
  }): string {
    // 返回的错误确实是无序的,需要使用keys这个数组按优先级判断哪些错误优先,否则返回错误不对
    const keys = [
      'isDefined',
      'isString',
      'isArray',
      'isNotEmpty',
      'isEnum',
      'matches',
      'customValidation',
    ];
    let content = 'Validation failed';
    forEach(keys, (v) => {
      if (has(constraints, v)) {
        content = get(constraints, v);
        return false;
      }
    });
    return content;
  }
}
