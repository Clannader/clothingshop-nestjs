import { Module, Global, Scope } from '@nestjs/common';
import { AopLogger } from './aop.logger';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [{
    provide: AopLogger,
    useClass: AopLogger,
    scope: Scope.TRANSIENT,
  }],
  exports: [AopLogger],
})
export class LoggerModule {}
