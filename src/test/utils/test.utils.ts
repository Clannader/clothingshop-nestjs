/**
 * Create by CC on 2022/6/19
 */
import { API_MODEL_PROPERTIES_ARRAY } from '@/common';
import { PickType } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

const isFunction = (val: any): boolean => typeof val === 'function';
const isString = (val: any): val is string => typeof val === 'string';
// 可以获取swagger模型的所有字段值
export const getModelProperties = function(prototype) {
  const properties = Reflect.getMetadata(API_MODEL_PROPERTIES_ARRAY, prototype) ||
    [];
  return properties
    .filter(isString)
    .filter((key) => key.charAt(0) === ':' && !isFunction(prototype[key]))
    .map((key) => key.slice(1));
}

/**
 * 可以克隆一个类出来,包含里面的元数据
 * @param clazz
 */
export const cloneClass = <TModel extends Type>(clazz: TModel) => {
  return PickType(clazz, getModelProperties(clazz.prototype))
}
