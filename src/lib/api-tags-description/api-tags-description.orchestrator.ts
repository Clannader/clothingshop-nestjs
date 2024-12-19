/**
 * Create by oliver.wu 2024/12/19
 */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ApiTagsDescriptionRegistry } from './api-tags-description.registry';

@Injectable()
export class ApiTagsDescriptionOrchestrator implements OnApplicationBootstrap {
  private readonly apiTagsRecord: Record<string, string> = {};

  constructor(
    private readonly apiTagsDescriptionRegistry: ApiTagsDescriptionRegistry,
  ) {}

  onApplicationBootstrap() {
    this.mountAddTagsDescription();
  }

  private mountAddTagsDescription() {
    const apiTagsKeys = Object.keys(this.apiTagsRecord);
    apiTagsKeys.forEach((key) => {
      this.apiTagsDescriptionRegistry.addApiTagsDescription(
        key,
        this.apiTagsRecord[key],
      );
    });
  }

  addApiTagsDescription(name: string, description: string) {
    this.apiTagsRecord[name] = description;
  }
}
