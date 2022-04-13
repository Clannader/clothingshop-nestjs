import { ConsoleLogger } from '@nestjs/common';

export class AopLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    console.log('打印日志');
    super.log(message, context);
  }
}
