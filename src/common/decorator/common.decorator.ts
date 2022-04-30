//import { applyDecorators HttpStatus, HttpCode } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { CodeEnum } from '../enum';
import { ApiHeaders, ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

/**
 * 定义它是一个class的修饰器
 * applyDecorators 这个是class和method都可以的修饰器
 * Bind 这个是method的修饰器
 * 所以这里写了一个只能是修饰class的修饰器
 */
export function BindClass(...decorators: any[]): ClassDecorator {
  return <TFunction extends Function>(target: TFunction | object) => {
    for (const decorator of decorators) {
      if (target instanceof Function) {
        (decorator as ClassDecorator)(target);
        continue;
      }
    }
  };
}

export function BindMethod(...decorators: any[]): MethodDecorator {
  return <TFunction extends Function, Y>(
    target: TFunction | object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<Y>,
  ) => {
    for (const decorator of decorators) {
      (decorator as MethodDecorator)(target, propertyKey, descriptor);
    }
  };
}

export function ApiCommon() {
  return BindClass(
    ApiHeaders([
      {
        name: 'Content-Type',
        description: '上下文协议',
        required: true,
        // 由于这个版本的swagger根本不支持default的值,只能使用enum写一个默认值上去了
        enum: ['application/json'],
      },
      {
        name: 'X-Requested-With',
        description: '固定请求头',
        required: true,
        enum: ['XMLHttpRequest'],
      },
      {
        name: 'credential',
        description: '用户凭证',
        required: true,
      },
      {
        name: 'language',
        description: '用户语言',
        enum: ['zh', 'en'],
      },
    ]),
    ApiResponse({
      status: CodeEnum.SUCCESS,
      description: '响应成功返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.EMPTY,
      description: '字段为空时返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.FAIL,
      description: '统一失败时返回该状态码',
    }),
    ApiResponse({
      status: CodeEnum.INVALID_SESSION,
      description: 'session无效时返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.NO_RIGHTS,
      description: '没有权限时返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.EXCEPTION,
      description: '发生异常时返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.INVALID_SYS_SETUP,
      description: '系统参数未开启时返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.UNKNOWN,
      description: '发生未知错误时返回该响应码',
    }),
  );
}

export function ApiCustomResponse(options: ApiResponseOptions) {
  return BindMethod(
    // HttpCode(HttpStatus.OK) // 这个状态码在POST请求时统一改不了成200,看了源代码,只认方法有名字为HttpCode的修饰器的值
    // 所以我换了一个名字,不写HttpCode的时候,取到的值是undefined,所以如果要改,只能每个post方法自己加上了,否则就默认是201
    ApiResponse({
      status: HttpStatus.OK,
      description: '成功返回',
      ...options,
    }),
  );
}
