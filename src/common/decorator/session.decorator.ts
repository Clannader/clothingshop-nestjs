/**
 * Create by CC on 2022/7/21
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CmsSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session.adminSession;
  },
);
