/**
 * Create by oliver.wu 2024/12/3
 */
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';
import {
  EVENT_ON_MESSAGE_METADATA,
  EVENT_SEND_MESSAGE_METADATA,
} from '../constants';

export type OnEventMessageType = string | symbol;

export interface OnEventMessageMetadata {
  message: OnEventMessageType;
}

export const OnEventMessage = (
  message: OnEventMessageType,
): MethodDecorator => {
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

export const SendEventMessage = (
  message: OnEventMessageType,
): MethodDecorator => {
  return applyDecorators(SetMetadata(EVENT_SEND_MESSAGE_METADATA, message));
};
