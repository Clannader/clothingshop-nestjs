/**
 * Create by oliver.wu 2024/12/3
 */
import { applyDecorators } from '@nestjs/common';
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';
import { EVENT_ON_MESSAGE_METADATA } from '../constants';
import parseEnv from '@/lib/parseEnv';

export interface OnEventMessageMetadata {
  message: string;
}

export interface OnEventMessageMap extends OnEventMessageMetadata {
  instance?: Record<string, Function>;
  methodKey?: string;
}

export const OnEventMessage = (message: string): MethodDecorator => {
  const decoratorFactory = (
    target: object,
    key?: any,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    extendArrayMetadata(
      EVENT_ON_MESSAGE_METADATA,
      [{ message } as OnEventMessageMetadata],
      descriptor!.value as (...args: any[]) => any,
    );
    return descriptor;
  };
  decoratorFactory.KEY = EVENT_ON_MESSAGE_METADATA;
  return decoratorFactory;
};

export const SendEventMessage = (message: string): MethodDecorator => {
  return applyDecorators(
    (
      target: object | Function,
      propertyKey?: string,
      descriptor?: TypedPropertyDescriptor<any>,
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]) {
        console.log(
          `Send messageType: ${message}, method: ${propertyKey} called with arguments:`,
          args,
        );
        if (parseEnv.read('clusterServer') === 'true') {
          process.send({
            notice: message,
            key: args[0],
            value: args[1],
          });
        }
        // 调用原始方法并返回其结果
        return originalMethod.apply(this, args);
      };
    },
  );
};
