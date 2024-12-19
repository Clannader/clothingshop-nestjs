/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OnEventMessageMetadata } from './decorators';
import {
  EVENT_ON_MESSAGE_METADATA,
  EVENT_SEND_MESSAGE_METADATA,
} from './constants';

@Injectable()
export class EventMessageMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getOnEventMessageHandlerMetadata(
    target: Function,
  ): OnEventMessageMetadata | undefined {
    return this.getMessageHandlerMetadata(EVENT_ON_MESSAGE_METADATA, target);
  }

  getSendEventMessageHandlerMetadata(
    target: Function,
  ): OnEventMessageMetadata | undefined {
    return this.getMessageHandlerMetadata(EVENT_SEND_MESSAGE_METADATA, target);
  }

  private getMessageHandlerMetadata(
    key: string,
    target: Function,
  ): OnEventMessageMetadata | undefined {
    if (
      !target ||
      (typeof target !== 'function' && typeof target !== 'object')
    ) {
      return undefined;
    }

    const metadata = this.reflector.get(key, target);
    if (!metadata) {
      return undefined;
    }
    return metadata;
  }
}
