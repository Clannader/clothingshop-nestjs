/**
 * Create by oliver.wu 2024/12/19
 */
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { ApiTagsDescriptionMetadataAccessor } from './api-tags-metadata.accessor';
import { ApiTagsDescriptionRegistry } from './api-tags-description.registry';

@Injectable()
export class ApiTagsDescriptionLoader
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly apiTagsDescriptionRegistry: ApiTagsDescriptionRegistry,
    private readonly metadataScanner: MetadataScanner,
    private readonly apiTagsDescriptionMetadataAccessor: ApiTagsDescriptionMetadataAccessor,
  ) {}

  onApplicationBootstrap() {
    this.explore();
  }

  onApplicationShutdown() {
    this.apiTagsDescriptionRegistry.clearApiTagsMap();
  }

  private explore(): void {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
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
            ? this.lookupApiTags(instance, name)
            : this.warnForNonStaticProviders(wrapper, instance, name); // 不懂什么情况会进来
        };

        this.metadataScanner
          .getAllMethodNames(prototype)
          .forEach(processMethod);
      });
  }

  private lookupApiTags(instance: Record<string, Function>, key: string) {
    const methodRef = instance[key];
    const metadata =
      this.apiTagsDescriptionMetadataAccessor.getApiTagsDescriptionMetadata(
        methodRef,
      );
    if (!metadata) {
      // 避免不是api-tags-description的修饰器也进来判断
      return;
    }
    // const controllerName =
    //   this.apiTagsDescriptionMetadataAccessor.getSwaggerApiTagsName(methodRef);
    console.log(metadata);
    this.apiTagsDescriptionRegistry.addApiTagsDescription(
      '222',
      metadata,
    );
  }

  private warnForNonStaticProviders(
    wrapper: InstanceWrapper<any>,
    instance: Record<string, Function>,
    key: string,
  ) {
    const methodRef = instance[key];
    const metadata =
      this.apiTagsDescriptionMetadataAccessor.getApiTagsDescriptionMetadata(
        methodRef,
      );
    if (!metadata) {
      return;
    }
    return;
  }
}
