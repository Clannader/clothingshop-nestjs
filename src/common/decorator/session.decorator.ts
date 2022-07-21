/**
 * Create by CC on 2022/7/21
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestSession } from '../common.types';

export const UserSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestSession = ctx.switchToHttp().getRequest();
    return request.session.adminSession;
  },
);
