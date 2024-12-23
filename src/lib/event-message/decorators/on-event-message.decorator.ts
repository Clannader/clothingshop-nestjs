/**
 * Create by oliver.wu 2024/12/3
 */
import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  EVENT_ON_MESSAGE_METADATA,
  EVENT_SEND_MESSAGE_METADATA,
  EVENT_MESSAGE_TYPE,
} from '../constants';
import { EventMessageTypeEnum } from '../enums';

export type OnEventMessageType = string | symbol;

export interface OnEventMessageMetadata {
  message: OnEventMessageType;
}

export const OnEventMessage = (
  message: OnEventMessageType,
): MethodDecorator => {
  return applyDecorators(
    SetMetadata(EVENT_ON_MESSAGE_METADATA, message),
    SetMetadata(EVENT_MESSAGE_TYPE, EventMessageTypeEnum.Listener),
  );
};

export const SendEventMessage = (
  message: OnEventMessageType,
): MethodDecorator => {
  return applyDecorators(
    SetMetadata(EVENT_SEND_MESSAGE_METADATA, message),
    SetMetadata(EVENT_MESSAGE_TYPE, EventMessageTypeEnum.Send),
  );
};
