import { ConsoleLogger } from '@nestjs/common';

export class AopLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    // 把这个logger加入了app里面,就不打印执行时间了,不知道为什么
    // 我现在知道为什么不打印时间了,是要设置logger参数才可以的
    if (context) {
      super.log(message, context);
    } else {
      super.log(message);
    }
  }
}
