/**
 * Create by CC on 2023/2/10
 */
import { Logger } from 'mongodb';
import { AopLogger } from './aop.logger';
import type { LoggerFunction } from 'mongodb';

export class MongodbLogger extends Logger {
  private readonly logger = new AopLogger(MongodbLogger.name);

  static currentLogger(): LoggerFunction {
    return function (message?: any) {
      this.logger.info(message);
    };
  }

  error(message: string, object?: unknown): void {
    // 暂时没发现怎么进去,以后触发了再说吧
    this.logger.error(message);
  }
}
