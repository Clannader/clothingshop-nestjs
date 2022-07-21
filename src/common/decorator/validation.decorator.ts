/**
 * Create by CC on 2022/7/21
 */
import { registerDecorator, ValidationOptions, ValidationArguments, buildMessage } from 'class-validator';
import { Utils } from '../utils';

interface CmsValiationOptions {
  optional?: boolean,
  type?: Object,
  default?: any,
  min?: number,
  max?: number,
  isInt?: boolean,
  enum?: any[]
}

interface ErrorResult {
  result: boolean,
  message?: string
}

export function CustomValidation(property: CmsValiationOptions, validationOptions?: ValidationOptions) {

  const validationResult = function(args: ValidationArguments):ErrorResult {
    const [relatedPropertyName] = args.constraints; // 传入的参数
    const relatedValue = args.value; // 传入的值
    if (relatedPropertyName.hasOwnProperty('optional')) {
      if (!relatedPropertyName.optional && Utils.isEmpty(relatedValue)) {
        return {
          result: false,
          message: 'ssss'
        }
      }
    }

    return {
      result: true
    }
  }

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'customValidation',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const errorResult = validationResult(args)
          return errorResult.result
        },
        defaultMessage(args: ValidationArguments) {
          const errorResult = validationResult(args)
          return errorResult.message
        }
      },
    });
  };
}
