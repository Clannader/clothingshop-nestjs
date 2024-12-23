/**
 * Create by oliver.wu 2024/12/20
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { SchedulerType } from '@nestjs/schedule/dist/enums/scheduler-type.enum';

import { IntervalsTaskNameAccessor } from './intervals-task-name.accessor';
import { IntervalsTaskNameRegistry } from './intervals-task-name.registry';

@Injectable()
export class IntervalTaskNameLoader implements OnModuleInit {
  private readonly logger = new Logger('IntervalTaskNameLoader');

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: IntervalsTaskNameAccessor,
    private readonly metadataScanner: MetadataScanner,
    private readonly registry: IntervalsTaskNameRegistry,
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ];
    instanceWrappers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;

      if (!instance || !Object.getPrototypeOf(instance)) {
        return;
      }

      const processMethod = (name: string) =>
        wrapper.isDependencyTreeStatic()
          ? this.lookupSchedulers(instance, name)
          : this.warnForNonStaticProviders(wrapper, instance, name);

      this.metadataScanner
        .getAllMethodNames(Object.getPrototypeOf(instance))
        .forEach(processMethod);
    });
  }

  lookupSchedulers(instance: Record<string, Function>, key: string) {
    const methodRef = instance[key];
    const metadata = this.metadataAccessor.getSchedulerType(methodRef);

    switch (metadata) {
      case SchedulerType.INTERVAL: {
        const intervalMetadata =
          this.metadataAccessor.getIntervalMetadata(methodRef);
        const name = this.metadataAccessor.getSchedulerName(methodRef);
        const intervalFn = this.wrapFunctionInTryCatchBlocks(
          methodRef,
          instance,
        );

        return this.registry.addIntervalFunctionName(name, intervalFn);
      }
    }
  }

  warnForNonStaticProviders(
    wrapper: InstanceWrapper<any>,
    instance: Record<string, Function>,
    key: string,
  ) {
    const methodRef = instance[key];
    const metadata = this.metadataAccessor.getSchedulerType(methodRef);

    switch (metadata) {
      case SchedulerType.INTERVAL: {
        this.logger.warn(
          `Cannot register interval "${wrapper.name}@${key}" because it is defined in a non static provider.`,
        );
        break;
      }
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
}
