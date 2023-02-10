/**
 * Create by CC on 2023/2/10
 */
import { Logger } from 'mongodb';
import { AopLogger } from './aop.logger';

export class MongodbLogger extends Logger {

  private readonly logger = new AopLogger(MongodbLogger.name);

  error(message: string, object?: unknown): void {
    // console.log('Error %s', message)
    // console.log(object)
    this.logger.error(message)
  }
}

