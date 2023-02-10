/**
 * Create by CC on 2023/2/10
 */
import { Logger } from 'mongodb';
import { AopLogger } from './aop.logger';

const logger = new AopLogger('MongodbLogger')

export class MongodbLogger extends Logger {

  error(message: string, object?: unknown): void {
    // TODO 完善和测试是否有效果
    console.log('Error %s', message)
    console.log(object)
    logger.error(message)
  }
}

