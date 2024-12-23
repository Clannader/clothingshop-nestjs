/**
 * Create by oliver.wu 2024/12/3
 */
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventMessageMetadataAccessor } from './event-message-metadata.accessor';
import { EventMessageLoader } from './event-message.loader';

@Module({
  imports: [DiscoveryModule],
  providers: [EventMessageLoader, EventMessageMetadataAccessor],
})
export class EventMessageModule {}
