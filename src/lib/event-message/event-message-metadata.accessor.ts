/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OnEventMessageMetadata } from './decorators';
import { EVENT_ON_MESSAGE_METADATA } from './constants';

@Injectable()
export class EventMessageMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getOnEventMessageHandlerMetadata(
    target: Function,
  ): OnEventMessageMetadata[] | undefined {
    if (
      !target ||
      (typeof target !== 'function' && typeof target !== 'object')
    ) {
      return undefined;
    }

    const metadata = this.reflector.get(EVENT_ON_MESSAGE_METADATA, target);
    if (!metadata) {
      return undefined;
    }
    return Array.isArray(metadata) ? metadata : [metadata];
  }
}
