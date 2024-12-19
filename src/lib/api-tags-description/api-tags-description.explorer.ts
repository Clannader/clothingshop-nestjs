/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { ApiTagsDescriptionMetadataAccessor } from './api-tags-metadata.accessor';
import { ApiTagsDescriptionOrchestrator } from './api-tags-description.orchestrator';
import { API_TAGS_DESC } from './constants';

@Injectable()
export class ApiTagsDescriptionExplorer implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly apiTagsDescriptionOrchestrator: ApiTagsDescriptionOrchestrator,
    private readonly metadataScanner: MetadataScanner,
    private readonly apiTagsDescriptionMetadataAccessor: ApiTagsDescriptionMetadataAccessor,
  ) {}

  onModuleInit() {
    this.explore();
  }

  private explore(): void {
    const instanceWrappers: InstanceWrapper[] = [
      ...this.discoveryService.getControllers(),
    ];
    instanceWrappers.forEach((wrapper: InstanceWrapper) => {
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

      this.metadataScanner.getAllMethodNames(prototype).forEach(processMethod);
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
    const controllName =
      this.apiTagsDescriptionMetadataAccessor.getSwaggerApiTagsName(methodRef);
    this.apiTagsDescriptionOrchestrator.addApiTagsDescription(
      controllName,
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
