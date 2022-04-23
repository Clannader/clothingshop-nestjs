import { applyDecorators } from '@nestjs/common';
import {
  ApiHeaders
} from '@nestjs/swagger';

export function ApiCommonHeader() {
  return applyDecorators(
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
    ])
  );
}
