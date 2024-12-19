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
import { EventMessageTypeEnum } from './enums';

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
    const instanceWrappers: InstanceWrapper[] = [
      // ...this.discoveryService.getControllers(), // 这个功能不会用在控制器上
      ...this.discoveryService.getProviders(),
    ];
    instanceWrappers
      .filter((wrapper) => wrapper.instance && !wrapper.isAlias)
      .forEach((wrapper: InstanceWrapper) => {
        const { instance } = wrapper;
        const prototype = Object.getPrototypeOf(instance);

        if (!instance || !prototype) {
          return;
        }

        const processMethod = (name: string) => {
          return wrapper.isDependencyTreeStatic()
            ? this.lookupEventMessages(instance, name)
            : this.warnForNonStaticProviders(wrapper, instance, name); // 不懂什么情况会进来
        };

        this.metadataScanner
          .getAllMethodNames(prototype)
          .forEach(processMethod);
      });
  }

  private lookupEventMessages(instance: Record<string, Function>, key: string) {
    const methodRef = instance[key];
    const metadata =
      this.metadataAccessor.getEventMessageTypeMetadata(methodRef);
    if (!metadata) {
      // 避免不是event-message的修饰器也进来判断
      return;
    }
    switch (metadata) {
      case EventMessageTypeEnum.Listener:
        const listenerMetadata =
          this.metadataAccessor.getOnEventMessageHandlerMetadata(methodRef);
        const listenerFn = this.wrapFunctionInTryCatchBlocks(
          methodRef,
          instance,
        );
        console.log(listenerMetadata);
        break;
      case EventMessageTypeEnum.Send:
        const sendMetadata =
          this.metadataAccessor.getSendEventMessageHandlerMetadata(methodRef);
        const sendFn = this.wrapFunctionInTryCatchBlocks(methodRef, instance);
        break;
    }
  }

  private wrapFunctionInTryCatchBlocks(methodRef: Function, instance: object) {
    return async (...args: unknown[]) => {
      try {
        await methodRef.call(instance, ...args);
      } catch (error) {
        this.logger.error(error);
      }
    };
  }

  private warnForNonStaticProviders(
    wrapper: InstanceWrapper<any>,
    instance: Record<string, Function>,
    key: string,
  ) {
    const methodRef = instance[key];
    const metadata =
      this.metadataAccessor.getEventMessageTypeMetadata(methodRef);
    if (!metadata) {
      return;
    }
    this.logger.debug('event-message:warnForNonStaticProviders进来了...');
    switch (metadata) {
      case EventMessageTypeEnum.Listener:
        this.logger.warn(
          `Cannot register message listener "${wrapper.name}@${key}" because it is defined in a non static provider.`,
        );
        break;
      case EventMessageTypeEnum.Send:
        this.logger.warn(
          `Cannot register message send "${wrapper.name}@${key}" because it is defined in a non static provider.`,
        );
        break;
    }
  }
}
