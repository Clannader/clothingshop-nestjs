import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
} from '@nestjs/swagger';

export function ApiCommonHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'credential',
      description: '用户凭证'
    })
  );
}
