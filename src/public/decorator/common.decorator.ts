import { applyDecorators } from '@nestjs/common';
import { CodeEnum } from '../enum/common.enum';
import {
  ApiHeaders,
  ApiResponse,
  // ApiOkResponse
} from '@nestjs/swagger';

export function ApiCommon() {
  return applyDecorators(
    ApiHeaders([
      {
        name: 'Content-Type',
        description: '上下文协议',
        required: true,
        // 由于这个版本的swagger根本不支持default的值,只能使用enum写一个默认值上去了
        enum: ['application/json']
      },
      {
        name: 'X-Requested-With',
        description: '固定请求头',
        required: true,
        enum: ['XMLHttpRequest']
      },
      {
        name: 'credential',
        description: '用户凭证',
        required: true
      },
      {
        name: 'language',
        description: '用户语言',
        enum: ['zh', 'en']
      }
    ]),
    ApiResponse(
      {
        status: CodeEnum.SUCCESS,
        description: '响应成功返回该响应码',
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.EMPTY,
        description: '字段为空时返回该响应码'
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.FAIL,
        description: '统一失败时返回该状态码'
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.INVALID_SESSION,
        description: 'session无效时返回该响应码'
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.NO_RIGHTS,
        description: '没有权限时返回该响应码'
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.EXCEPTION,
        description: '发生异常时返回该响应码'
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.INVALID_SYS_SETUP,
        description: '系统参数未开启时返回该响应码'
      }
    ),
    ApiResponse(
      {
        status: CodeEnum.UNKNOWN,
        description: '发生未知错误时返回该响应码'
      }
    )
  );
}
