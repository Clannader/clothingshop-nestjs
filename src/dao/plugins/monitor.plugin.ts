/**
 * Create by CC on 2022/6/3
 */
import { Schema } from 'mongoose';
import * as Log4js from 'log4js';
import { Utils } from '@/common/utils';
import { omit } from 'lodash';

const logger = Log4js.getLogger('fileLogs');
const parserLog =
  '[{methodName}]-[{modelName}]-[{result}]-[{query}]-[{projection}]-[{options}]-[{params}]-[{diffTime}]';

type schemaConfig = {
  statics: {
    [x: string]: {
      call: (arg0: any) => any;
    };
  };
};

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

  // 获取更新版本的字段名'__v'
  const versionKey: string = schema.get('versionKey') as string;

  schema.pre('save', function () {
    // save和create是一样的
    // console.log(this) // 这个this似乎是创建的参数,并且里面包含了_id
    // const { _id, ...params } = JSON.parse(JSON.stringify(this))

    // 这里的this指针指向的是document

    // 这里的this.set(key, value) 其实是设置创建参数的,设置schema里面的字段值,如果设置的key不在schema里面时,
    // post()时的get(key)是get不出来的。如果key等于了schema里面的值时,就会覆盖外层调用设置的值,所以不可取

    // 还有一种方法就是直接this.xxx=xxx,然后post()时,result.xxx可以获取到值,但是如果xxx等于了schema里面某个
    // 字段的值时会修改外层调用时的对于的key的值

    // 这里相当于创建的时候加入了_lastTime这个字段,但是由于schema里面没有声明这个字段,所以不会存库
    // this._lastTime = new Date().getTime(); // 可以在post的时候的result._lastTime取值

    // 不过这个方法更好
    this.$locals.lastTime = new Date().getTime(); // 可以参考mongoose/types/document.d.ts的Document(第47行)
    // 这里加入save时加入版本号的校验,避免拿回来的数据已经被更新过了
    this.$where = {
      ...this.$where,
      [versionKey]: this[versionKey],
    };
    this.increment(); // 这里就是抛出版本号异常,但是查看源码好像是开启doIncrement这个参数,可以给版本号自动加1
    // 源代码路径mongoose/lib/model 418行
  });
  schema.post('save', function (result) {
    // logger.info('创建后:%s', JSON.stringify(result)); // 这里的result只是加多了一个__v字段
    writeDocumentLog.call(this, schema, result);
  });

  // mongoose版本7.x以上,remove方法已经删除,所以不需要使用这个方法做拦截了
  // schema.pre('remove', function () {
  //   this.$locals.lastTime = new Date().getTime();
  //   // 删除时没办法判断版本是否更新了,感觉这个版本只有编辑数据时才有用
  //   // this.$where = {
  //   //   ...this.$where,
  //   //   [versionKey]: this[versionKey],
  //   // };
  // });
  // schema.post('remove', function (result) {
  //   writeDocumentLog.call(this, schema, result);
  // });

  schema.pre('find', async function () {
    // this.mongooseOptions({
    //   // lean: true, // 测试发现确实是这里使用中间件可以设置全部查询都是使用这个参数了
    // });

    this.setOptions({
      _lastTime: new Date().getTime(),
    });

    // 查询使用下面的方法其实是设置更新的条件,也就是this.getUpdate()=this.set(xxx, value)里面的值
    // 但是又由于查询的时候用不到更新的条件,所以是可以计算查询的时间差的
    // this.set('_lastTime', new Date().getTime());

    // pre里面传什么方法,外部调用就是什么方法名
    // console.log(this.model.modelName) // 表名
    // console.log(this.getQuery()) // 查询语句
    // console.log(this.projection()) // 返回字段
    // console.log(this.getOptions()) // 其他参数
  });
  schema.post('find', function (result) {
    writeQueryLog.call(this, schema, result);
  });

  schema.pre('findOne', function () {
    this.setOptions({
      _lastTime: new Date().getTime(),
    });
  });
  schema.post('findOne', function (result) {
    writeQueryLog.call(this, schema, result);
  });

  schema.pre('findOneAndUpdate', function () {
    this.setOptions({
      _lastTime: new Date().getTime(),
    });
    // 如果参数里面设置了{upsert: true}, __v则不会加1,就算数据库中有数据也不会加1,因为这个参数的意思就是新建
    // 所以只有findOneAndUpdate加了upsert参数后就认为是新建了,会重置所有字段的值,所以每次运行都只能设置成0
    const $where = this.getUpdate();
    if (!Utils.isEmpty($where?.['$setOnInsert']?.[versionKey])) {
      delete $where['$setOnInsert'][versionKey];
    }
    // 更新时版本号自动加1
    this.setUpdate({
      ...$where,
      $inc: {
        [versionKey]: 1,
        ...$where?.['$inc'],
      },
    });
  });
  schema.post('findOneAndUpdate', function (result) {
    writeQueryLog.call(this, schema, result);
  });

  schema.pre('updateOne', function () {
    this.setOptions({
      _lastTime: new Date().getTime(),
    });
    const $where = this.getUpdate();
    // 更新时如果加上{upsert: true},需要删除$setOnInsert里面的__v,不然报异常
    // 其实这里不应该用Utils.isEmpty,应该用判断是否还有这个节点的方法判断,但是由于值是0,也不是不可以将就
    if (!Utils.isEmpty($where?.['$setOnInsert']?.[versionKey])) {
      delete $where['$setOnInsert'][versionKey];
    }
    // 更新时版本号自动加1
    this.setUpdate({
      ...$where,
      $inc: {
        [versionKey]: 1,
        ...$where?.['$inc'],
      },
    });
    // 这里由于是更新的方法,所以下面的设置更新条件是没有用的,因为外层传过来的条件会直接覆盖
    // this.set('_lastTime', new Date().getTime());
  });
  schema.post('updateOne', function (result) {
    writeQueryLog.call(this, schema, result);
  });

  schema.pre('deleteOne', function () {
    this.setOptions({
      _lastTime: new Date().getTime(),
    });
  });
  schema.post('deleteOne', function (result) {
    writeQueryLog.call(this, schema, result);
  });
};

const writeQueryLog = function (schema: schemaConfig, result: any) {
  const { _lastTime, ...options } = this.getOptions();
  const logJSON = {
    methodName: this.op,
    modelName: schema.statics['getAliasName'].call(this),
    result: result ? JSON.stringify(result) : '', // result有可能是空的,因为查询可能是null的
    query: this.getQuery() ? JSON.stringify(this.getQuery()) : '',
    projection: this.projection() ? JSON.stringify(this.projection()) : '',
    options: JSON.stringify(options),
    params: this.getUpdate() ? JSON.stringify(this.getUpdate()) : '',
    diffTime: new Date().getTime() - _lastTime,
  };
  logger.info(Utils.replaceArgsFromJson(parserLog, logJSON, true));
};

const writeDocumentLog = function (schema: schemaConfig, result: any) {
  const cloneResult = JSON.parse(JSON.stringify(result));
  const logJSON = {
    methodName: this.$op, // 要不然写死create|save,要么写this.$op
    modelName: schema.statics['getAliasName'].call(this),
    result: JSON.stringify(cloneResult),
    params: JSON.stringify(omit(cloneResult, '_id', '__v')),
    diffTime: new Date().getTime() - this.$locals.lastTime,
  };
  logger.info(Utils.replaceArgsFromJson(parserLog, logJSON, true));
};
