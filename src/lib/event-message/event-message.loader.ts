/**
 * Create by oliver.wu 2024/12/19
 */
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  ContextIdFactory,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

import { EventMessageMetadataAccessor } from './event-message-metadata.accessor';

@Injectable()
export class EventMessageLoader
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly injector = new Injector();
  private readonly logger = new Logger('EventMessage');

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: EventMessageMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
  ) {}

  onApplicationBootstrap() {
    this.loadEventMessageListeners();
  }

  onApplicationShutdown() {}

  private loadEventMessageListeners(): void {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    [...providers, ...controllers]
      .filter(wrapper => wrapper.instance && !wrapper.isAlias)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance) || {};
        const isRequestScoped = !wrapper.isDependencyTreeStatic();
        // this.logger.log(instance)
        // this.logger.log(prototype)
        // this.logger.log(isRequestScoped)
        console.log(instance)
        console.log(prototype)
        console.log(isRequestScoped)
      });
  }
}
