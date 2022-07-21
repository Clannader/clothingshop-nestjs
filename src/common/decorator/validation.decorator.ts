/**
 * Create by CC on 2022/7/21
 */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isArray,
  isBoolean,
  isDate,
  isEnum,
  isInt,
  isNumber,
  isObject,
  isString,
} from 'class-validator';
import { Utils } from '../utils';

interface CmsValiationOptions {
  optional?: boolean, // 缺省,true表示可不填该字段
  type?: 'array' | 'boolean' | 'date' | 'enum' | 'int' | 'number' | 'object' | 'string', // 校验类型
  // default?: any, // 默认值
  min?: number, // 如果是数字类型,最小值
  max?: number, // 如果是数字类型,最大值
  isInt?: boolean, // 判断是否是数字类型
  enum?: any[] // 固定范围值
}

interface ErrorResult {
  result: boolean,
  message?: string
}

const typeMapper = {
  array: isArray,
  boolean: isBoolean,
  date: isDate,
  enum: isEnum,
  int: isInt,
  number: isNumber,
  object: isObject,
  string: isString,
}

const validationResult = function(args: ValidationArguments):ErrorResult {
  const [relatedPropertyName] = args.constraints; // 传入的参数
  const relatedValue = args.value; // 传入的值
  if (relatedPropertyName.hasOwnProperty('optional')) {
    if (!relatedPropertyName.optional && Utils.isEmpty(relatedValue)) {
      return {
        result: false,
        message: '$property should not be empty'
      }
    }
  }
  // 这里的判空需要排除空格,避免只能输入数字,但是传过来''以为是空值进而不去判断类型了
  if (relatedPropertyName.hasOwnProperty('type') && !Utils.isEmpty(relatedValue, true)) {
    const type = relatedPropertyName.type
    if (!typeMapper[type].call(this, relatedValue)) {
      return {
        result: false,
        message: `$property must be a ${type}`
      }
    }
  }

  return {
    result: true
  }
}

export function CustomValidation(property: CmsValiationOptions, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'customValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return validationResult(args).result
        },
        defaultMessage(args: ValidationArguments) {
          return validationResult(args).message
        }
      },
    });
  };
}
