/**
 * Create by CC on 2023/2/10
 * 参考文档
 * https://www.mongodb.com/zh-cn/docs/drivers/node/current/fundamentals/logging/
 */
// import { MongoLogger } from 'mongodb';
// import { AopLogger } from './aop.logger';
// import type { LoggerFunction } from 'mongodb';
//
// export class MongodbLogger extends MongoLogger {
//   private readonly logger = new AopLogger(MongodbLogger.name);
//
//   static currentLogger(): LoggerFunction {
//     return function (message?: any) {
//       this.logger.info(message);
//     };
//   }
//
//   error(message: string, object?: unknown): void {
//     // 暂时没发现怎么进去,以后触发了再说吧
//     this.logger.error(message);
//   }
// }
