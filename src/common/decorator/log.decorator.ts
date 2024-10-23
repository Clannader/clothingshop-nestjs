/**
 * Create by oliver.wu 2024/10/22
 */
import { WRITE_LOG } from '@/common';

interface ArgsFnParams {
  value: any; // 字段值
  key: string; // 字段名
  obj: any; // 原本对象值
}

type PropOptionsLog = {
  origin: string; // 对应翻译函数的参数值
  key: string;
  argsFn?: (params: ArgsFnParams) => any; // 翻译函数需要的args
};

export type MetadataLog = PropOptionsLog & {
  propertyName: string;
  propertyType: any;
};

export function WriteLog(options: PropOptionsLog): PropertyDecorator {
  return function (target: object, propertyName: string): void {
    const metaData: MetadataLog[] =
      Reflect.getMetadata(WRITE_LOG, target) || [];
    metaData.push({
      ...options,
      propertyName,
      propertyType: Reflect.getMetadata('design:type', target, propertyName),
    });
    Reflect.defineMetadata(WRITE_LOG, metaData, target);
  };
}
