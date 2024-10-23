/**
 * Create by oliver.wu 2024/10/22
 */

type PropOptionsLog = {
  origin: string; // 对应翻译函数的参数值
  key: string;
}

export function WriteLog(options: PropOptionsLog): PropertyDecorator {
  return function(object: object, propertyName: string): void {
    console.log(object)
  };
}