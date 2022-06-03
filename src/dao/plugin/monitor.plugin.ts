/**
 * Create by CC on 2022/6/3
 */
import { Schema } from 'mongoose';
import * as Log4js from 'log4js';

const logger = Log4js.getLogger('fileLogs');

export const monitorPlugin = function (schema: Schema): void {
  schema.pre('save', function () {
    // save和create是一样的
    // console.log(this) // 这个this似乎是创建的参数,并且里面包含了_id
    logger.info('创建前:%s', JSON.stringify(this));
  });
  schema.post('save', (result) => {
    logger.info('创建后:%s', JSON.stringify(result)); // 这里的result只是加多了一个__v字段
  });

  schema.pre('find', async function () {
    logger.info('find前');
    // this.mongooseOptions({
    //   // lean: true, // 测试发现确实是这里使用中间件可以设置全部查询都是使用这个参数了
    // });
    this.set('time', new Date().getTime());
    const fun = () =>
      new Promise((resolve) => setTimeout(() => resolve(1), 300));
    await fun();
    // pre里面传什么方法,外部调用就是什么方法名
    // console.log(this.model.modelName) // 表名
    // console.log(this.getQuery()) // 查询语句
    // console.log(this.projection()) // 返回字段
    // console.log(this.getOptions()) // 其他参数
  });
  schema.post('find', function (result) {
    const lastTime = this.get('time');
    logger.info('find后: %s ms', new Date().getTime() - lastTime);
    // console.log(this._mongooseOptions)
    // console.log(result) // 返回数据
  });

  schema.pre('findOne', function () {
    logger.info('findOne前');
    this.set('time', new Date().getTime());
    // console.log(this.getQuery())
    // console.log(this.getOptions())
    // console.log(this.projection())
  });
  schema.post('findOne', function (result) {
    const lastTime = this.get('time');
    logger.info('findOne后: %s ms', new Date().getTime() - lastTime);
    // console.log(result)
  });
};
