import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    // {
    //   provide: AopLogger,
    //   useClass: AopLogger,
    //   scope: Scope.TRANSIENT, // 单例导出范例
    // },
  ],
})
export class LoggerModule {}
