import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidateException } from '@/common';
import { has, get } from 'lodash'

@Injectable()
export class ValidationPipe<T> implements PipeTransform<T> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !ValidationPipe.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    console.log(object)
    console.log(value)
    const errors: ValidationError[] = await validate(object);
    if (errors.length > 0) {
      // 如果报错,取第一个提示
      // 发现不能直接取第一个做提示,因为有多个错误时,返回的第一个并不是想要的那个提示语
      // 所以这里需要做一个优先级的提示判断
      const constraints = errors[0].constraints;
      let content = ''
      if (has(constraints, 'isNotEmpty')){
        content = get(constraints, 'isNotEmpty')
      } else if (has(constraints, 'matches')) {
        content = get(constraints, 'matches')
      }
      throw new ValidateException(content);
    }
    return value;
  }

  private static toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
