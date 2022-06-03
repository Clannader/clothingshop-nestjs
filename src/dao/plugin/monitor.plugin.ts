/**
 * Create by CC on 2022/6/3
 */
import { Schema } from 'mongoose';
import * as Log4js from 'log4js';

const logger = Log4js.getLogger('fileLogs');

export const monitorPlugin = function(schema: Schema): void {

  schema.pre('save', function() {
    // console.log(this) // 这个this似乎是创建的参数,并且里面包含了_id
    logger.info('创建前:%s', JSON.stringify(this))
  })
  schema.post('save', result => {
    logger.info('创建后:%s', JSON.stringify(result)) // 这里的result只是加多了一个__v字段
  })

  schema.pre('find', function(){
    logger.info('find前')
    console.log(this.getQuery())
    console.log(this.getOptions())
    console.log(this.projection())
  })
  schema.post('find', result => {
    logger.info('find后')
    console.log(result)
  })

}
