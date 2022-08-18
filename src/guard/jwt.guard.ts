/**
 * Create by CC on 2022/8/18
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    return true;
  }
}
