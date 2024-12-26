/**
 * Create by oliver.wu 2024/12/19
 */
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { EventMessageMetadataAccessor } from './event-message-metadata.accessor';
import { ConfigService } from '@/common/config';
import * as process from 'node:process';

@Injectable()
export class EventMessageLoader
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger('EventMessage');

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: EventMessageMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly configService: ConfigService,
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

        const processMethod = (methodKey: string) => {
          return wrapper.isDependencyTreeStatic()
            ? this.lookupEventMessages(instance, methodKey)
            : this.warnForNonStaticProviders(wrapper, instance, methodKey); // 不懂什么情况会进来,猜测Scope=Request会进来
        };

        this.metadataScanner
          .getAllMethodNames(prototype)
          .forEach(processMethod);
      });
  }

  private lookupEventMessages(
    instance: Record<string, Function>,
    methodKey: string,
  ) {
    const methodRef = instance[methodKey];
    const eventListenerMetadatas =
      this.metadataAccessor.getOnEventMessageHandlerMetadata(methodRef);
    if (!eventListenerMetadatas) {
      // 避免不是event-message的修饰器也进来判断
      return;
    }

    for (const eventListenerMetadata of eventListenerMetadatas) {
      const { message } = eventListenerMetadata;
      const listenerMethod = process.on.bind(process);
      listenerMethod(
        message,
        this.wrapFunctionInTryCatchBlocks(methodRef, instance),
      );
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
      this.metadataAccessor.getOnEventMessageHandlerMetadata(methodRef);
    if (!metadata) {
      return;
    }
    this.logger.debug('event-message:warnForNonStaticProviders come in...');
    this.logger.warn(
      `Cannot register message listener "${wrapper.name}@${key}" because it is defined in a non static provider.`,
    );
  }
}
