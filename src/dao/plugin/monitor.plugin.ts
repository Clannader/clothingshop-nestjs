/**
 * Create by CC on 2022/6/3
 */
import { Schema } from 'mongoose';
import * as Log4js from 'log4js';
import { Utils } from '../../common';

const logger = Log4js.getLogger('fileLogs');
const parserLog =
  '[{methodName}]-[{modelName}]-[{result}]-[{query}]-[{projection}]-[{options}]-[{params}]-[{diffTime}]';

export const monitorPlugin = function (schema: Schema): void {
  // 中间件主要还是看mongoose的文档可以了解得更多
  // 中间件分4种:document 中间件,model 中间件,aggregate 中间件,和 query 中间件
  // 每种中间件有对应的方法
  // document操作对应 init validate save remove
  // query 中间件对应 count find findOne findOneAndRemove findOneAndUpdate update
  // aggregate 中间件对应 aggregate
  // model 中间件对应 insertMany
  // 注意query是没有remove钩子的,只有document有,所以设定了remove的钩子,将会在doc.remove()调用而不是model.remove()
  // 中调用。并且create()函数触发的是save()钩子
  // 钩子一般分串行和并行两种,但是这里一般使用的是串行了

  // 注意2：save()函数触发validate()钩子,mongoose validate()其实就是pre('save')钩子,这意味着pre('validate')和
  // post('validate')都会在pre('save')钩子之前调用
  schema.pre('save', function () {
    // save和create是一样的
    // console.log(this) // 这个this似乎是创建的参数,并且里面包含了_id
    // const { _id, ...params } = JSON.parse(JSON.stringify(this))

    // 这里的this.set(key, value) 其实是设置创建参数的,设置schema里面的字段值,如果设置的key不在schema里面时,
    // post()时的get(key)是get不出来的。如果key等于了schema里面的值时,就会覆盖外层调用设置的值,所以不可取
    // 还有一种方法就是直接this.xxx=xxx,然后post()时,result.xxx可以获取到值,但是如果xxx等于了schema里面某个
    // 字段的值时会修改外层调用时的对于的key的值
    // 这里相当于创建的时候加入了_lastTime这个字段,但是由于schema里面没有声明这个字段,所以不会存库
    this._lastTime = new Date().getTime();
  });
  schema.post('save', function (result) {
    // logger.info('创建后:%s', JSON.stringify(result)); // 这里的result只是加多了一个__v字段
    const { _id, __v, ...params } = JSON.parse(JSON.stringify(result));
    const logJSON = {
      methodName: 'create',
      modelName: schema.statics['getAliasName'].call(this),
      result: JSON.stringify({ _id, ...params }),
      params: JSON.stringify(params),
      diffTime: new Date().getTime() - result._lastTime,
    };
    logger.info(Utils.replaceArgsFromJson(parserLog, logJSON, true));
  });

  schema.pre('find', async function () {
    // this.mongooseOptions({
    //   // lean: true, // 测试发现确实是这里使用中间件可以设置全部查询都是使用这个参数了
    // });
    this.set('_lastTime', new Date().getTime());
    // pre里面传什么方法,外部调用就是什么方法名
    // console.log(this.model.modelName) // 表名
    // console.log(this.getQuery()) // 查询语句
    // console.log(this.projection()) // 返回字段
    // console.log(this.getOptions()) // 其他参数
  });
  schema.post('find', function (result) {
    writeFileLog.call(this, schema, 'find', result);
  });

  schema.pre('findOne', function () {
    this.set('_lastTime', new Date().getTime());
  });
  schema.post('findOne', function (result) {
    writeFileLog.call(this, schema, 'findOne', result);
  });
};

const writeFileLog = function (schema, methodName, result) {
  const lastTime = this.get('_lastTime');
  const logJSON = {
    methodName,
    modelName: schema.statics['getAliasName'].call(this),
    result: result ? JSON.stringify(result) : '', // result有可能是空的,因为查询可能是null的
    query: JSON.stringify(this.getQuery()),
    projection: JSON.stringify(this.projection()),
    options: JSON.stringify(this.getOptions()),
    diffTime: new Date().getTime() - lastTime,
  };
  logger.info(Utils.replaceArgsFromJson(parserLog, logJSON, true));
};
