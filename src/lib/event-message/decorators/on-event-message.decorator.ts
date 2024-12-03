/**
 * Create by oliver.wu 2024/12/3
 */
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';
import { EVENT_MESSAGE_METADATA } from '../constants';

export type OnEventMessageType = string | symbol;

export interface OnEventMessageMetadata {
  message: OnEventMessageType;
}

export const OnEventMessage = (message?: OnEventMessageType): MethodDecorator => {
  const decoratorFactory = (
    target: object,
    key?: any,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    extendArrayMetadata(
      EVENT_MESSAGE_METADATA,
      [{ message } as OnEventMessageMetadata],
      descriptor!.value as (...args: any[]) => any,
    );
    return descriptor;
  };
  decoratorFactory.KEY = EVENT_MESSAGE_METADATA;
  return decoratorFactory;
}