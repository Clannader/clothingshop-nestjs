import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { CodeEnum } from '../enum';
import {
  ApiHeaders,
  ApiResponse,
  ApiResponseOptions,
  ApiHeaderOptions,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';
import { API_MODEL_PROPERTIES } from '../constants';

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
        // continue;
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

export function ApiCommon(showCredential = true) {
  const headers: ApiHeaderOptions[] = [
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
      name: 'language',
      description: '用户语言:(ZH=中文,EN=English)',
      enum: ['ZH', 'EN'],
    },
  ];
  if (showCredential) {
    headers.push({
      name: 'credential',
      description: '用户凭证,通过登录接口获得该凭证',
      required: true,
    });
  }
  return applyDecorators(
    ApiHeaders(headers),
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
      status: CodeEnum.INVALID_HEADERS,
      description: '请求头错误时返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.SESSION_EXPIRED,
      description: '凭证过期返回该响应码',
    }),
    ApiResponse({
      status: CodeEnum.FIRST_LOGIN,
      description: '第一次登录需要修改密码',
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
      description: '返回成功',
      ...options,
    }),
  );
}

/**
 * 泛型类响应专用修饰器
 * @param targetModel 接口响应类
 * @param subModel 泛型类
 */
export const ApiGenericsResponse = <TModel extends Type, SModel extends Type>(
  targetModel: TModel,
  subModel: SModel,
) => {
  // 这里写死了泛型的固定字段是results
  const fieldResults = 'results';
  const prototype = targetModel.prototype;
  // 哎,无语啊,研究了好几天这个泛型的swagger写法,还是没有写成功,就算成功了,重写里面的元数据的值时,下一次的覆盖会影响之前修改过的值
  // 也就是说泛型里面的元数据只认最后一次的修改的结果值,不能每次都独立开,坑爹的js,真不如java
  // 放弃了,不搞了,以后学到其他高阶知识再回来弄了,思路就是可以复制新的元数据的值丢回给swagger的修饰器中
  if (Reflect.hasMetadata(API_MODEL_PROPERTIES, prototype, fieldResults)) {
    // 因为这个results是在原型链上的,所以使用getOwnMetadata是获取不到它的,它是父类的字段值
    console.log(Reflect.getOwnMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      fieldResults,
    ))
    const metadataResult = Reflect.getMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      fieldResults,
    );
    metadataResult.type = 'array';
    metadataResult.items = {
      $ref: getSchemaPath(subModel),
    };
    // 这里获取自己字段的元数据值
    console.log(Reflect.getMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      'rows',
    ))
    // 删除自己的字段对应的元数据
    console.log(Reflect.deleteMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      'rows',
    ))
    // 删除父类字段的元数据,发现删除不成功,返回false
    console.log(Reflect.deleteMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      fieldResults,
    ))
    // 删除自己字段元数据后,获取看看是否还存在,返回undefined
    console.log(Reflect.getMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      'rows',
    ))
    // 修改泛型类的元数据的值
    Reflect.defineMetadata(
      API_MODEL_PROPERTIES,
      metadataResult,
      prototype,
      fieldResults,
    );
  }

  const fieldObject = 'result';
  if (Reflect.hasMetadata(API_MODEL_PROPERTIES, prototype, fieldObject)) {
    const metadataResult = Reflect.getMetadata(
      API_MODEL_PROPERTIES,
      prototype,
      fieldObject,
    );
    metadataResult.allOf = [
      {
        $ref: getSchemaPath(subModel),
      },
    ];
    Reflect.defineMetadata(
      API_MODEL_PROPERTIES,
      metadataResult,
      prototype,
      fieldObject,
    );
  }

  return BindMethod(
    ApiExtraModels(targetModel, subModel),
    ApiResponse({
      status: HttpStatus.OK,
      description: '返回成功',
      schema: {
        $ref: getSchemaPath(targetModel),
      },
    }),
  );
};
