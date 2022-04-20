import { Module, Global, Scope } from '@nestjs/common';
import { AopLogger } from './AopLogger';

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
