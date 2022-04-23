import { ConsoleLogger } from '@nestjs/common';

export class AopLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    console.log('打印日志'); // 把这个logger加入了app里面,就不打印执行时间了,不知道为什么
    super.log(message, context);
  }
}
